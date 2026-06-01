import { useEffect, useMemo, useState } from "react";
import { createId, getAllHangoutProposals, getCurrentUserKey, getDisplayName, getVisibleGroupsForProfile } from "./appState";
import { copyTextWithAlert } from "./clipboard";
import { sendNotificationEmails } from "./notificationEmail";
import OutsidersSideNav from "./OutsidersSideNav";
import { buildAppUrl, buildGroupInviteLink } from "./siteConfig";
import { availabilityToText, hasAvailability } from "./scheduling";
import { hydrateMembersWithProfileLinks, isSupabaseConfigured, supabase } from "./supabase";

function profileRouteParamsForMember(member, groupId) {
  return {
    groupId: groupId ? String(groupId) : "",
    memberKey: member?.username ? `username:${String(member.username).replace(/^@/, "").toLowerCase()}` : `name:${String(member?.name || "").trim().toLowerCase()}`,
  };
}

function normalizeMemberEmail(value = "") {
  return String(value || "").trim().toLowerCase();
}

function memberIdentityKey(member = {}, index = 0) {
  return [
    member.userId,
    member.username ? String(member.username).trim().toLowerCase() : "",
    normalizeMemberEmail(member.email),
    String(member.name || "").trim().toLowerCase(),
    index,
  ]
    .filter((value) => value !== null && value !== undefined && value !== "")
    .join("::");
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
    billWatch: group.billWatch || group.bill_watch || { electedMemberName: "", votes: {}, checklist: [] },
    peaceMaker: group.peaceMaker || group.peace_maker || { electedMemberName: "", votes: {}, oath: "" },
  };
}

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
  .root::before {
    content: '';
    position: fixed;
    inset: 0;
    background: transparent;
    pointer-events: none;
    z-index: 0;
  }
  .root::after {
    content: 'POW! BAM! WOW!';
    position: fixed;
    right: -18px;
    top: 68px;
    font: 400 clamp(28px, 4vw, 54px) 'Bangers', cursive;
    letter-spacing: 0.12em;
    color: rgba(255, 107, 107, 0.22);
    transform: rotate(-8deg);
    pointer-events: none;
    z-index: 0;
  }
  .shell {
    max-width: 1380px;
    margin: 0 auto;
    padding: 32px 24px 64px;
    display: grid;
    gap: 32px;
    position: relative;
    z-index: 1;
  }
  .glass, .card {
    border-radius: 22px;
    border: 4px solid #17151f;
    background: #fffdf7;
    box-shadow: 8px 8px 0 #17151f;
    position: relative;
    overflow: hidden;
  }
  .glass::before, .card::before {
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
    gap: 20px;
    padding: 24px 28px;
    flex-wrap: wrap;
  }
  .card { padding: 28px; }
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
    background: #ff7a59;
    border: 3px solid #17151f;
    border-radius: 14px;
    display: grid;
    place-items: center;
    box-shadow: 4px 4px 0 #17151f;
    transform: rotate(-7deg);
  }
  .hero {
    padding: 38px;
    background: #fff2a6;
  }
  .layout {
    display: grid;
    grid-template-columns: 320px minmax(0, 1fr);
    gap: 28px;
  }
  .sidebar-stack, .detail-stack {
    display: grid;
    gap: 22px;
    align-content: start;
  }
  .section-header {
    display: grid;
    gap: 8px;
    margin-bottom: 20px;
  }
  .section-copy {
    margin: 0;
    color: #667085;
    line-height: 1.65;
    max-width: 68ch;
  }
  .content-stack {
    display: grid;
    gap: 18px;
  }
  .content-divider {
    height: 3px;
    border-radius: 999px;
    background: rgba(23, 21, 31, 0.08);
  }
  .section-divider {
    height: 3px;
    border-radius: 999px;
    background: rgba(23, 21, 31, 0.08);
    margin: 4px 0;
  }
  .crew-card {
    padding: 18px;
    border-radius: 16px;
    border: 3px solid #17151f;
    background: #fff7e8;
    box-shadow: 5px 5px 0 #17151f;
    cursor: pointer;
    position: relative;
    text-align: left;
  }
  .crew-card-top {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: flex-start;
  }
  .crew-card-meta {
    display: grid;
    gap: 8px;
    min-width: 0;
  }
  .crew-card-summary {
    color: #667085;
    font-weight: 800;
    line-height: 1.4;
  }
  .crew-card-badge {
    border-radius: 999px;
    border: 3px solid #17151f;
    box-shadow: 3px 3px 0 #17151f;
    padding: 7px 10px;
    font: 400 12px 'Bangers', cursive;
    letter-spacing: 0.06em;
    color: #17151f;
    white-space: nowrap;
  }
  .crew-card.active, .crew-card:hover {
    transform: translate(-2px, -3px) rotate(-0.7deg);
    background: #e8f8ff;
    border-color: #00a8cc;
    box-shadow: 7px 7px 0 #00a8cc;
  }
  .bangers {
    font-family: 'Bangers', cursive;
    letter-spacing: 0.04em;
  }
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
    background: #ff6b6b;
    color: white;
  }
  .btn.secondary {
    background: #ffd93d;
    color: #17151f;
  }
  .btn.ghost {
    background: #ffffff;
    color: #17151f;
  }
  .tab-row {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
  .tab-btn {
    padding: 12px 16px;
    border-radius: 999px;
    background: #fff1c7;
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
    background: #fff8ea;
    padding: 20px;
    box-shadow: 5px 5px 0 #17151f;
    position: relative;
    overflow: hidden;
  }
  .proposal-card {
    display: grid;
    gap: 18px;
  }
  .proposal-card.empty {
    gap: 10px;
    padding: 18px 20px;
    min-height: 0;
  }
  .proposal-meta {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  .proposal-footer {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    align-items: flex-start;
    padding-top: 2px;
  }
  .proposal-card::after, .member-row::after, .pending-row::after, .bill-card::after {
    content: '';
    position: absolute;
    right: -18px;
    top: -20px;
    width: 82px;
    height: 82px;
    border-radius: 50%;
    background: rgba(255,217,61,0.2);
    pointer-events: none;
  }
  .proposal-card.empty::after {
    display: none;
  }
  .vote-grid, .member-list, .roast-list {
    display: grid;
    gap: 16px;
  }
  .bill-watch-shell {
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr);
    gap: 16px;
    align-items: start;
  }
  .bill-watch-main, .bill-watch-side {
    display: grid;
    gap: 14px;
  }
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 14px;
  }
  .summary-card {
    border-radius: 16px;
    border: 3px solid #17151f;
    padding: 16px 18px;
    background: #fff7da;
    box-shadow: 4px 4px 0 #17151f;
  }
  .bill-card.active {
    background: #eefdf5;
    border-color: #51cf66;
    box-shadow: 5px 5px 0 #51cf66;
  }
  .bill-vote-meta {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 8px;
  }
  .mini-pill {
    display: inline-flex;
    align-items: center;
    padding: 6px 10px;
    border-radius: 999px;
    border: 2px solid #17151f;
    background: #fffdf7;
    box-shadow: 2px 2px 0 #17151f;
    font-size: 12px;
    font-weight: 800;
    color: #475467;
  }
  .checklist-panel {
    border-radius: 16px;
    border: 3px solid #17151f;
    background: #fff6df;
    box-shadow: 5px 5px 0 #17151f;
    padding: 16px;
    display: grid;
    gap: 12px;
  }
  .checklist-item {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
    border-radius: 12px;
    border: 3px solid #17151f;
    background: #fffdf7;
    box-shadow: 3px 3px 0 #17151f;
    padding: 12px;
  }
  .vote-btn {
    width: 100%;
    padding: 12px 14px;
    border-radius: 12px;
    text-align: left;
    background: #fff5de;
    border: 3px solid #17151f;
    box-shadow: 3px 3px 0 #17151f;
    position: relative;
    z-index: 1;
  }
  .vote-btn.active {
    background: #e8fde8;
    border-color: #51cf66;
    box-shadow: 4px 4px 0 #51cf66;
  }
  .roast-card {
    background: #fff2df;
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
    background: #fff7e4;
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
  .invite-link-box {
    display: grid;
    gap: 10px;
    margin-top: 16px;
    border-radius: 14px;
    border: 3px solid #17151f;
    background: #fff7e4;
    box-shadow: 4px 4px 0 #17151f;
    padding: 14px;
  }
  .invite-link-value {
    width: 100%;
    min-width: 0;
    border-radius: 10px;
    border: 2px dashed rgba(23, 21, 31, 0.42);
    background: #fffdf7;
    padding: 10px 12px;
    color: #475467;
    font: 800 13px 'Nunito', sans-serif;
    overflow-wrap: anywhere;
    user-select: all;
  }
  .edit-modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 180;
    background: rgba(23, 21, 31, 0.48);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .edit-modal {
    width: min(720px, 100%);
    max-height: calc(100vh - 40px);
    overflow-y: auto;
    border-radius: 22px;
    border: 4px solid #17151f;
    background: #fffdf7;
    box-shadow: 8px 8px 0 #17151f;
    padding: 24px;
    display: grid;
    gap: 16px;
  }
  .edit-list {
    display: grid;
    gap: 10px;
  }
  .edit-row {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
    border-radius: 12px;
    border: 3px solid #17151f;
    background: #fff7e4;
    box-shadow: 3px 3px 0 #17151f;
    padding: 10px 12px;
    font-weight: 800;
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
    background: #fff7da;
  }
  .crew-header {
    display: grid;
    gap: 18px;
  }
  .crew-header-top {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    align-items: flex-start;
    flex-wrap: wrap;
  }
  .crew-header-meta {
    display: grid;
    gap: 10px;
  }
  .crew-header-actions {
    display: grid;
    gap: 12px;
    justify-items: end;
  }
  .crew-header-stats {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  .crew-header-buttons {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  .crew-action-btn {
    min-width: 156px;
    justify-content: center;
  }
  .section-grid {
    display: grid;
    gap: 14px;
  }
  @media (max-width: 860px) {
    .proposal-columns {
      grid-template-columns: 1fr !important;
    }
    .bill-watch-shell {
      grid-template-columns: 1fr;
    }
    .crew-header-actions,
    .crew-header-stats,
    .crew-header-buttons {
      justify-items: stretch;
      justify-content: flex-start;
    }
    .crew-action-btn {
      min-width: 0;
      width: 100%;
    }
  }
  @media (max-width: 1080px) {
    .layout {
      grid-template-columns: 1fr;
    }
  }
  @media (max-width: 720px) {
    .shell { padding: 18px 14px 40px; gap: 20px; }
    .glass, .hero, .card { padding: 20px; border-radius: 24px; }
    .root::after { display: none; }
  }
`;

const GROUP_COLORS = ["#ff8f7a", "#6ed7ff", "#73e2a7", "#ffcf6e", "#c6a6ff"];
const EMPTY_PROFILE = {};

function formatDurationHours(value) {
  if (!Number.isFinite(value) || value <= 0) return "Flexible";
  return `${value} hour${value === 1 ? "" : "s"}`;
}

function countVotes(votes = {}, optionId) {
  return Object.values(votes).filter((value) => value === optionId).length;
}

function pickWinner(options = [], votes = {}) {
  return [...options].sort((a, b) => countVotes(votes, b.id) - countVotes(votes, a.id))[0] || null;
}

function countMemberVotes(votes = {}, memberName) {
  return Object.values(votes).filter((value) => value === memberName).length;
}

function memberRecipientKey(member = {}) {
  if (member.userId) return `user:${member.userId}`;
  if (member.username) return `username:${String(member.username).replace(/^@/, "").toLowerCase()}`;
  return `name:${String(member.name || "").trim().toLowerCase()}`;
}

function getLeaderFromMemberVotes(members = [], votes = {}) {
  const ranked = members
    .map((member) => ({ name: member.name, count: countMemberVotes(votes, member.name) }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  const top = ranked[0];
  const runnerUp = ranked[1];

  if (!top || top.count === 0) return null;
  if (runnerUp && runnerUp.count === top.count) {
    return { name: "", count: top.count, isTie: true };
  }
  return { name: top.name, count: top.count, isTie: false };
}

function normalizeOwnerUsername(value = "") {
  return String(value || "").replace(/^@/, "").trim().toLowerCase();
}

export default function OutsidersFriendGroups({ onNavigate, appData, setAppData, routeParams = {} }) {
  const profile = useMemo(() => appData?.profile || EMPTY_PROFILE, [appData?.profile]);
  const profileName = profile.name || profile.username || "You";
  const currentName = getDisplayName(profile);
  const currentUserKey = getCurrentUserKey(profile);
  const allGroups = useMemo(() => appData?.groups ?? [], [appData?.groups]);
  const allHangouts = useMemo(() => getAllHangoutProposals(allGroups, appData?.hangouts || []), [allGroups, appData?.hangouts]);
  const groups = useMemo(
    () => getVisibleGroupsForProfile(allGroups, profile).map((group) => ({
      ...group,
      hangoutProposals: allHangouts.filter((proposal) => String(proposal.groupId) === String(group.id)),
    })),
    [allGroups, profile, allHangouts]
  );
  const [selectedGroupId, setSelectedGroupId] = useState(routeParams?.groupId || groups[0]?.id || "");
  const [activeTab, setActiveTab] = useState(routeParams?.tab || "Hangouts");
  const [editingProposalId, setEditingProposalId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [editDraft, setEditDraft] = useState({
    name: "",
    description: "",
    durationHours: "",
    timeOptions: [],
    locationOptions: [],
    externalInvites: [],
    agenda: [],
    planningDetails: {
      reservationStatus: "not-needed",
      reservationName: "",
      meetingPoint: "",
      followUpNotes: "",
    },
    newTime: "",
    newLocation: "",
    newAgendaSection: "",
    newAgendaTime: "",
    newAgendaTitle: "",
    newAgendaNotes: "",
  });
  const [notice, setNotice] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [isSendingInviteEmail, setIsSendingInviteEmail] = useState(false);
  const selectedGroup = groups.find((group) => String(group.id) === String(selectedGroupId)) || groups[0] || null;
  const currentMember = selectedGroup?.members?.find((member) => (
    (currentUserId && String(member.userId || "").trim() === String(currentUserId).trim())
    || (profile.id && String(member.userId || "").trim() === String(profile.id).trim())
    || (profile.username && String(member.username || "").trim().toLowerCase() === `@${String(profile.username).trim().toLowerCase()}`)
    || (profile.email && normalizeMemberEmail(member.email) === normalizeMemberEmail(profile.email))
    || String(member.name || "").trim() === currentName
  )) || null;
  const isCurrentMemberAdmin = currentMember?.role === "Admin";
  const debriefCount = selectedGroup?.cases?.length || 0;
  const openDebriefCount = (selectedGroup?.cases || []).filter((caseItem) => caseItem.status !== "Resolved").length;
  const editingProposal = selectedGroup?.hangoutProposals?.find((proposal) => proposal.id === editingProposalId) || null;
  const pendingDeclines = (selectedGroup?.pending || []).filter((item) => item?.type === "decline-note");

  async function persistSharedGroup(nextGroup, options = {}) {
    if (!isSupabaseConfigured || !nextGroup?.id || String(nextGroup.id).startsWith("group-")) return true;
    if (options.remove) {
      const { error } = await supabase.from("groups").delete().eq("id", nextGroup.id);
      if (error) {
        setNotice(error.message || "We could not update that crew yet.");
        return false;
      }
      return true;
    }

    const { error } = await supabase
      .from("groups")
      .update({
        owner_id: nextGroup.owner_id || nextGroup.ownerId || null,
        owner_username: nextGroup.owner_username || nextGroup.ownerUsername || "",
        members: nextGroup.members || [],
        expenses: nextGroup.expenses || [],
        pending: nextGroup.pending || [],
        cases: nextGroup.cases || [],
        hangout_proposals: nextGroup.hangoutProposals || [],
        bill_watch: nextGroup.billWatch || {},
        peace_maker: nextGroup.peaceMaker || {},
      })
      .eq("id", nextGroup.id);

    if (error) {
      setNotice(error.message || "We could not sync that crew yet.");
      return false;
    }

    return true;
  }

  async function createCrewNotificationsForMembers(members = [], payload = {}) {
    if (!isSupabaseConfigured) return;
    const { members: resolvedMembers } = await hydrateMembersWithProfileLinks(members);
    const recipientRows = resolvedMembers
      .filter((member) => member.userId)
      .map((member) => ({
        user_id: member.userId,
        recipient: member.name,
        recipient_key: memberRecipientKey(member),
        group_id: payload.groupId || null,
        group_name: payload.groupName || "",
        proposal_id: payload.proposalId || null,
        action_screen: payload.actionScreen || "",
        action_params: payload.actionParams || {},
        type: payload.type || "general",
        message: typeof payload.message === "function" ? payload.message(member) : payload.message,
        read: false,
      }));

    if (!recipientRows.length) return;
    const { error } = await supabase.from("notifications").insert(recipientRows);
    if (error) {
      console.warn("Notification sync failed:", error.message);
    }

    if (payload.skipEmail) return;

    try {
      await sendNotificationEmails({
        recipients: resolvedMembers
          .filter((member) => member.userId && member.email)
          .map((member) => ({ email: member.email, name: member.name })),
        subject: payload.emailSubject || `${payload.groupName || "Your crew"} has an update`,
        intro: payload.emailIntro || (typeof payload.message === "string" ? payload.message : "There is a new crew update waiting for you."),
        ctaLabel: payload.emailCtaLabel || "Open update",
        ctaUrl: payload.emailCtaUrl || buildAppUrl(payload.actionScreen || "friend-groups", payload.actionParams || {}),
        details: payload.emailDetails || [],
        excludeEmails: [profile.email],
      });
    } catch (emailError) {
      console.warn("Notification email sync failed:", emailError.message);
    }
  }

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;

    let active = true;

    async function loadCurrentUser() {
      const { data } = await supabase.auth.getUser();
      if (active) {
        setCurrentUserId(data.user?.id || null);
      }
    }

    loadCurrentUser();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUserId(session?.user?.id || null);
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (routeParams?.groupId) {
        setSelectedGroupId(String(routeParams.groupId));
      }
      if (routeParams?.tab) {
        setActiveTab(String(routeParams.tab));
      }
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [routeParams?.groupId, routeParams?.tab]);

  useEffect(() => {
    setAppData?.((prev) => {
      const usernameTag = profile.username ? `@${profile.username}` : "";
      const isMeCheck = (m) =>
        m.name === currentName
        || (usernameTag && m.username === usernameTag)
        || (!usernameTag && !m.username && m.name === "You" && currentName !== "You");

      const needsSync = (prev.groups || []).some((group) =>
        (group.members || []).some((m) =>
          isMeCheck(m) && (
            m.name !== currentName
            || (usernameTag && m.username !== usernameTag)
            || (hasAvailability(profile.availability) && availabilityToText(m.availability) !== availabilityToText(profile.availability))
          )
        )
      );
      if (!needsSync) return prev;
      return {
        ...prev,
        groups: (prev.groups || []).map((group) => ({
          ...group,
          members: (group.members || []).map((member) => {
            if (!isMeCheck(member)) return member;
            return {
              ...member,
              name: currentName,
              username: usernameTag || member.username,
              ...(hasAvailability(profile.availability) ? { availability: profile.availability } : {}),
            };
          }),
        })),
      };
    });
  }, [currentName, profile.availability, profile.username, setAppData]);

  const copyCrewInviteLink = async () => {
    if (!selectedGroup?.code) {
      setNotice("Pick a crew before copying an invite link.");
      return;
    }

    const inviteLink = buildGroupInviteLink(selectedGroup.code);
    const copied = await copyTextWithAlert(inviteLink, `Crew invite link copied for ${selectedGroup.name}.`);
    if (copied) {
      setNotice(`Invite link copied for ${selectedGroup.name}.`);
    } else {
      setNotice("We generated the crew link, but your browser blocked auto-copy.");
    }
  };

  const sendCrewInviteEmail = async () => {
    if (!selectedGroup?.code) {
      setNotice("Pick a crew before sending an invite email.");
      return;
    }

    const email = inviteEmail.trim();
    if (!email || !email.includes("@")) {
      setNotice("Enter a valid email address for the invite.");
      return;
    }

    setIsSendingInviteEmail(true);
    setNotice("");

    try {
      const inviteLink = buildGroupInviteLink(selectedGroup.code);
      let result;
      try {
        result = await sendNotificationEmails({
          recipients: [{ email, name: email.split("@")[0] }],
          subject: `${currentName} invited you to join ${selectedGroup.name} on Outsiders`,
          intro: `${currentName} invited you to join ${selectedGroup.name} on Outsiders.`,
          ctaLabel: "Join crew",
          ctaUrl: inviteLink,
          details: [
            `Crew: ${selectedGroup.name}`,
            `Crew code: ${selectedGroup.code}`,
          ],
        });
      } catch (error) {
        console.warn("[Outsiders] Crew invite email send failed, opening mail client fallback:", error?.message || error);
        result = { failed: true };
      }

      if (result?.failed) {
        const subject = encodeURIComponent(`${currentName} invited you to join ${selectedGroup.name} on Outsiders`);
        const body = encodeURIComponent(`Hey!\n\n${currentName} invited you to join the crew "${selectedGroup.name}" on Outsiders.\n\nClick the link below to accept or decline the crew invitation:\n${inviteLink}\n\nCrew Code: ${selectedGroup.code}\n\nSee you there!`);
        window.location.assign(`mailto:${email}?subject=${subject}&body=${body}`);
        setNotice(`Opened email draft for ${email} as a fallback.`);
      } else {
        setNotice(`Invite email sent to ${email}.`);
      }

      await createCrewNotificationsForMembers(selectedGroup.members, {
        type: "crew-invite-sent",
        groupId: selectedGroup.id,
        groupName: selectedGroup.name,
        actionScreen: "friend-groups",
        actionParams: { groupId: selectedGroup.id, tab: "Invites" },
        message: `${currentName} sent a crew invite for ${selectedGroup.name} to ${email}.`,
        skipEmail: true,
      });

      setInviteEmail("");
    } finally {
      setIsSendingInviteEmail(false);
    }
  };

  const clearPendingInviteNote = async (pendingId) => {
    if (!selectedGroup || !pendingId) return;
    const nextGroup = {
      ...selectedGroup,
      pending: (selectedGroup.pending || []).filter((item) => String(item.id) !== String(pendingId)),
    };
    const saved = await persistSharedGroup(nextGroup);
    if (!saved) return;
    setAppData?.((prev) => ({
      ...prev,
      groups: (prev.groups || []).map((group) => (
        group.id === selectedGroup.id ? nextGroup : group
      )),
    }));
    setNotice("Invite activity was cleared.");
  };

  const castProposalVote = async (proposalId, category, optionId) => {
    if (!selectedGroup) return;
    const nextGroup = {
      ...selectedGroup,
      hangoutProposals: (selectedGroup.hangoutProposals || []).map((proposal) => (
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
    };
    const saved = await persistSharedGroup(nextGroup);
    if (!saved) return;
    setAppData?.((prev) => ({
      ...prev,
      groups: (prev.groups || []).map((group) => (
        group.id === selectedGroup.id ? nextGroup : group
      )),
    }));
  };

  const finalizeProposal = async (proposal) => {
    if (!selectedGroup) return;
    const winningTime = pickWinner(proposal.timeOptions, proposal.votes?.time);
    const winningLocation = pickWinner(proposal.locationOptions, proposal.votes?.location);
    const nextGroup = {
      ...selectedGroup,
      hangoutProposals: (selectedGroup.hangoutProposals || []).map((item) => (
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
    };
    const saved = await persistSharedGroup(nextGroup);
    if (!saved) return;
    await createCrewNotificationsForMembers(nextGroup.members, {
      type: "hangout-updated",
      groupId: nextGroup.id,
      groupName: nextGroup.name,
      proposalId: proposal.id,
      actionScreen: "friend-groups",
      actionParams: { groupId: nextGroup.id, tab: "Hangouts" },
      message: `${proposal.name} was finalized in ${nextGroup.name}.`,
      emailSubject: `${proposal.name} was finalized in ${nextGroup.name}`,
      emailIntro: `${proposal.name} now has a finalized crew pick in ${nextGroup.name}.`,
      emailCtaLabel: "Open hangout",
      emailDetails: [
        `Crew: ${nextGroup.name}`,
        `Hangout: ${proposal.name}`,
      ],
    });
    setAppData?.((prev) => ({
      ...prev,
      groups: (prev.groups || []).map((group) => (
        group.id === selectedGroup.id ? nextGroup : group
      )),
    }));
    setNotice(`${proposal.name} was finalized for the crew.`);
  };

  const startEditingProposal = (proposal) => {
    setEditingProposalId(proposal.id);
    setEditDraft({
      name: proposal.name || "",
      description: proposal.description || "",
      durationHours: proposal.durationHours || (proposal.durationMinutes ? proposal.durationMinutes / 60 : ""),
      timeOptions: proposal.timeOptions || [],
      locationOptions: proposal.locationOptions || [],
      externalInvites: proposal.externalInvites || [],
      agenda: proposal.agenda || [],
      planningDetails: {
        reservationStatus: proposal.planningDetails?.reservationStatus || "not-needed",
        reservationName: proposal.planningDetails?.reservationName || "",
        meetingPoint: proposal.planningDetails?.meetingPoint || "",
        followUpNotes: proposal.planningDetails?.followUpNotes || "",
      },
      newTime: "",
      newLocation: "",
      newAgendaSection: "",
      newAgendaTime: "",
      newAgendaTitle: "",
      newAgendaNotes: "",
    });
  };

  const closeEditProposal = () => {
    setEditingProposalId(null);
    setEditDraft({
      name: "",
      description: "",
      durationHours: "",
      timeOptions: [],
      locationOptions: [],
      externalInvites: [],
      agenda: [],
      planningDetails: {
        reservationStatus: "not-needed",
        reservationName: "",
        meetingPoint: "",
        followUpNotes: "",
      },
      newTime: "",
      newLocation: "",
      newAgendaSection: "",
      newAgendaTime: "",
      newAgendaTitle: "",
      newAgendaNotes: "",
    });
  };

  const addEditTimeOption = () => {
    const label = editDraft.newTime.trim();
    if (!label) return;
    setEditDraft((prev) => ({
      ...prev,
      timeOptions: prev.timeOptions.some((option) => option.label.toLowerCase() === label.toLowerCase())
        ? prev.timeOptions
        : [...prev.timeOptions, { id: createId("time"), label }],
      newTime: "",
    }));
  };

  const addEditLocationOption = () => {
    const label = editDraft.newLocation.trim();
    if (!label) return;
    setEditDraft((prev) => ({
      ...prev,
      locationOptions: prev.locationOptions.some((option) => option.label.toLowerCase() === label.toLowerCase())
        ? prev.locationOptions
        : [...prev.locationOptions, { id: createId("place"), label }],
      newLocation: "",
    }));
  };

  const addEditAgendaStep = () => {
    const title = editDraft.newAgendaTitle.trim();
    const notes = editDraft.newAgendaNotes.trim();
    if (!title && !notes) return;

    setEditDraft((prev) => ({
      ...prev,
      agenda: [
        ...prev.agenda,
        {
          id: createId("agenda"),
          section: prev.newAgendaSection.trim() || "Custom",
          time: prev.newAgendaTime.trim(),
          title: title || notes.slice(0, 42) || "Hangout step",
          notes,
          source: "manual",
        },
      ],
      newAgendaSection: "",
      newAgendaTime: "",
      newAgendaTitle: "",
      newAgendaNotes: "",
    }));
  };

  const saveEditedProposal = async () => {
    if (!selectedGroup || !editingProposal) return;
    if (!editDraft.name.trim()) {
      setNotice("Give the hangout a name before saving.");
      return;
    }
    if (!editDraft.timeOptions.length || !editDraft.locationOptions.length) {
      setNotice("Keep at least one time and one place option.");
      return;
    }

    const nextDuration = editDraft.durationHours === "" ? null : Number(editDraft.durationHours);
    const allowedTimeIds = new Set(editDraft.timeOptions.map((option) => option.id));
    const allowedLocationIds = new Set(editDraft.locationOptions.map((option) => option.id));
    const updateProposal = (proposal) => {
      if (proposal.id !== editingProposal.id) return proposal;
      return {
        ...proposal,
        name: editDraft.name.trim(),
        description: editDraft.description.trim(),
        durationHours: Number.isFinite(nextDuration) && nextDuration > 0 ? nextDuration : null,
        durationMinutes: Number.isFinite(nextDuration) && nextDuration > 0 ? Math.max(30, Math.round(nextDuration * 60)) : null,
        timeOptions: editDraft.timeOptions,
        locationOptions: editDraft.locationOptions,
        externalInvites: editDraft.externalInvites,
        agenda: editDraft.agenda,
        planningDetails: {
          reservationStatus: editDraft.planningDetails.reservationStatus || "not-needed",
          reservationName: editDraft.planningDetails.reservationName.trim(),
          meetingPoint: editDraft.planningDetails.meetingPoint.trim(),
          followUpNotes: editDraft.planningDetails.followUpNotes.trim(),
        },
        votes: {
          ...(proposal.votes || {}),
          time: Object.fromEntries(Object.entries(proposal.votes?.time || {}).filter(([, value]) => allowedTimeIds.has(value))),
          location: Object.fromEntries(Object.entries(proposal.votes?.location || {}).filter(([, value]) => allowedLocationIds.has(value))),
        },
        updatedAt: new Date().toISOString(),
      };
    };

    const nextGroup = {
      ...selectedGroup,
      hangoutProposals: (selectedGroup.hangoutProposals || []).map(updateProposal),
    };
    const saved = await persistSharedGroup(nextGroup);
    if (!saved) return;
    await createCrewNotificationsForMembers(nextGroup.members, {
      type: "hangout-updated",
      groupId: nextGroup.id,
      groupName: nextGroup.name,
      proposalId: editingProposal.id,
      actionScreen: "friend-groups",
      actionParams: { groupId: nextGroup.id, tab: "Hangouts" },
      message: `${editDraft.name.trim()} was updated in ${nextGroup.name}.`,
      emailSubject: `${editDraft.name.trim()} was updated in ${nextGroup.name}`,
      emailIntro: `${editDraft.name.trim()} has fresh hangout updates in ${nextGroup.name}.`,
      emailCtaLabel: "Open hangout",
      emailDetails: [
        `Crew: ${nextGroup.name}`,
        `Hangout: ${editDraft.name.trim()}`,
      ],
    });
    setAppData?.((prev) => ({
      ...prev,
      groups: (prev.groups || []).map((group) => (
        group.id === selectedGroup.id ? nextGroup : group
      )),
      hangouts: (prev.hangouts || []).map(updateProposal),
      notifications: prev.notifications || [],
    }));
    closeEditProposal();
    setNotice("Hangout updated.");
  };

  const deleteProposal = async (proposal) => {
    if (!selectedGroup || !proposal) return;
    const canManageProposal = proposal.proposerName === currentName || isCurrentMemberAdmin;
    if (!canManageProposal) return;

    const confirmed = window.confirm(`Delete ${proposal.name}? This removes the planned hangout, votes, and related notifications.`);
    if (!confirmed) return;

    const nextGroup = {
      ...selectedGroup,
      hangoutProposals: (selectedGroup.hangoutProposals || []).filter((item) => item.id !== proposal.id),
    };
    const saved = await persistSharedGroup(nextGroup);
    if (!saved) return;
    setAppData?.((prev) => ({
      ...prev,
      groups: (prev.groups || []).map((group) => (
        group.id === selectedGroup.id ? nextGroup : group
      )),
      hangouts: (prev.hangouts || []).filter((item) => item.id !== proposal.id),
      notifications: (prev.notifications || []).filter((notification) => notification.proposalId !== proposal.id),
    }));

    if (editingProposalId === proposal.id) {
      closeEditProposal();
    }
    setNotice(`${proposal.name} was deleted.`);
  };

  const leaveGroup = async (targetGroup = selectedGroup) => {
    if (!targetGroup) return;
    const memberIndex = targetGroup.members.findIndex((m) => (
      (currentUserId && String(m.userId || "") === String(currentUserId))
      || m.name === currentName
      || (profile.username && m.username === `@${profile.username}`)
    ));
    if (memberIndex === -1) return;
    const member = targetGroup.members[memberIndex];
    const remainingMembers = targetGroup.members.filter((_, idx) => idx !== memberIndex);
    const isLeavingOwner = (
      (currentUserId && String(targetGroup.ownerId || targetGroup.owner_id || "") === String(currentUserId))
      || (profile.username && normalizeOwnerUsername(targetGroup.ownerUsername || targetGroup.owner_username || "") === normalizeOwnerUsername(profile.username))
    );

    if (!remainingMembers.length) {
      let saved = false;
      if (isSupabaseConfigured && targetGroup?.id && !String(targetGroup.id).startsWith("group-")) {
        const { error } = await supabase.rpc("leave_group", {
          next_group_id: targetGroup.id,
          leaving_member: member,
          updated_group: { ...targetGroup, members: [] },
        });
        if (error) {
          const missingRpc = /leave_group|function.*not.*exist|schema cache/i.test(error.message || "");
          if (!missingRpc) {
            setNotice(error.message || "We could not leave that crew yet.");
            return;
          }
          saved = await persistSharedGroup(targetGroup, { remove: true });
        } else {
          saved = true;
        }
      } else {
        saved = await persistSharedGroup(targetGroup, { remove: true });
      }
      if (!saved) return;
      setAppData?.((prev) => ({
        ...prev,
        groups: (prev.groups || []).filter((group) => String(group.id) !== String(targetGroup.id)),
        notifications: (prev.notifications || []).filter((notification) => String(notification.groupId) !== String(targetGroup.id)),
      }));
      setSelectedGroupId((currentId) => (
        String(currentId) === String(targetGroup.id)
          ? (groups.find((group) => String(group.id) !== String(targetGroup.id))?.id || "")
          : currentId
      ));
      setNotice(`${targetGroup.name} was deleted because you were the last member.`);
      return;
    }

    const nextMembers = remainingMembers.some((m) => m.role === "Admin")
      ? remainingMembers
      : remainingMembers.map((m, index) => ({ ...m, role: index === 0 ? "Admin" : (m.role || "Member") }));
    const nextOwnerMember = isLeavingOwner
      ? nextMembers.find((m) => m.role === "Admin") || nextMembers[0] || null
      : null;

    const nextGroup = {
      ...targetGroup,
      owner_id: isLeavingOwner ? (nextOwnerMember?.userId || null) : (targetGroup.owner_id || targetGroup.ownerId || null),
      ownerId: isLeavingOwner ? (nextOwnerMember?.userId || null) : (targetGroup.ownerId || targetGroup.owner_id || null),
      owner_username: isLeavingOwner
        ? normalizeOwnerUsername(nextOwnerMember?.username || "")
        : (targetGroup.owner_username || targetGroup.ownerUsername || ""),
      ownerUsername: isLeavingOwner
        ? normalizeOwnerUsername(nextOwnerMember?.username || "")
        : (targetGroup.ownerUsername || targetGroup.owner_username || ""),
      members: nextMembers,
      hangoutProposals: (targetGroup.hangoutProposals || []).map((proposal) => ({
        ...proposal,
        participants: (proposal.participants || []).filter((p) => p.name !== member.name && p.username !== member.username),
        votes: {
          ...(proposal.votes || {}),
          availability: Object.fromEntries(Object.entries(proposal.votes?.availability || {}).filter(([key]) => key !== currentUserKey)),
          vibe: Object.fromEntries(Object.entries(proposal.votes?.vibe || {}).filter(([key]) => key !== currentUserKey)),
          time: Object.fromEntries(Object.entries(proposal.votes?.time || {}).filter(([key]) => key !== currentUserKey)),
          location: Object.fromEntries(Object.entries(proposal.votes?.location || {}).filter(([key]) => key !== currentUserKey)),
        },
      })),
      billWatch: (() => {
        const filteredVotes = Object.fromEntries(
          Object.entries(targetGroup.billWatch?.votes || {}).filter(([key, value]) => key !== currentUserKey && value !== member.name)
        );
        const leader = getLeaderFromMemberVotes(nextMembers, filteredVotes);
        return {
          ...(targetGroup.billWatch || {}),
          electedMemberName: leader?.isTie ? "" : (leader?.name || ""),
          votes: filteredVotes,
        };
      })(),
    };
    let saved = false;
    let savedGroup = nextGroup;
    if (isSupabaseConfigured && nextGroup?.id && !String(nextGroup.id).startsWith("group-")) {
      const { data, error } = await supabase.rpc("leave_group", {
        next_group_id: nextGroup.id,
        leaving_member: member,
        updated_group: nextGroup,
      });
      if (error) {
        const missingRpc = /leave_group|function.*not.*exist|schema cache/i.test(error.message || "");
        if (!missingRpc) {
          setNotice(error.message || "We could not leave that crew yet.");
          return;
        }
        saved = await persistSharedGroup(nextGroup);
      } else {
        saved = true;
        if (data) savedGroup = normalizeSupabaseGroup(data);
      }
    } else {
      saved = await persistSharedGroup(nextGroup);
    }
    if (!saved) return;
    setAppData?.((prev) => ({
      ...prev,
      groups: (prev.groups || []).map((group) => {
        if (String(group.id) !== String(targetGroup.id)) return group;
        return savedGroup;
      }),
      notifications: (prev.notifications || []).filter((notification) => String(notification.groupId) !== String(targetGroup.id)),
    }));
    setSelectedGroupId((currentId) => (
      String(currentId) === String(targetGroup.id)
        ? (groups.find((group) => String(group.id) !== String(targetGroup.id))?.id || "")
        : currentId
    ));
    setNotice(
      targetGroup.members.length === 1
        ? `${targetGroup.name} was deleted because you were the last member.`
        : `You left ${targetGroup.name}.`
    );
  };

  const deleteGroup = async (targetGroup = selectedGroup) => {
    if (!targetGroup) return;
    const member = targetGroup.members.find((m) => (
      (currentUserId && String(m.userId || "") === String(currentUserId))
      || m.name === currentName
      || m.username === `@${profile.username}`
    ));
    if (member?.role !== "Admin") return;
    const isOwner = (
      (currentUserId && String(targetGroup.ownerId || targetGroup.owner_id || "") === String(currentUserId))
      || (profile.username && String(targetGroup.ownerUsername || targetGroup.owner_username || "").toLowerCase() === String(profile.username).toLowerCase())
    );

    if (isOwner && (targetGroup.members?.length || 0) > 1) {
      const deleteForEveryone = window.confirm(`Delete ${targetGroup.name} for everyone? Press OK to delete the whole crew. Press Cancel to choose leaving just for yourself instead.`);
      if (!deleteForEveryone) {
        const leaveOnly = window.confirm(`Do you want to remove only yourself from ${targetGroup.name} and keep the crew for everyone else?`);
        if (leaveOnly) {
          await leaveGroup(targetGroup);
        }
        return;
      }
    } else {
      const confirmed = window.confirm(`Delete ${targetGroup.name} for everyone? This removes the whole crew and its proposals.`);
      if (!confirmed) return;
    }

    const saved = await persistSharedGroup(targetGroup, { remove: true });
    if (!saved) return;

    setAppData?.((prev) => ({
      ...prev,
      groups: (prev.groups || []).filter((group) => String(group.id) !== String(targetGroup.id)),
      notifications: (prev.notifications || []).filter((notification) => String(notification.groupId) !== String(targetGroup.id)),
    }));
    setSelectedGroupId((currentId) => (
      String(currentId) === String(targetGroup.id)
        ? (groups.find((group) => String(group.id) !== String(targetGroup.id))?.id || "")
        : currentId
    ));
    setNotice(`${targetGroup.name} was deleted.`);
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="root">
        <OutsidersSideNav activeLabel="My Crew" onNavigate={onNavigate} profileName={profileName} notificationCount={(appData?.notifications || []).filter((n) => !n.read).length} appData={appData} setAppData={setAppData}>
        <div className="shell">
          <section className="glass hero">
              <div style={{ display: "grid", gap: 12 }}>
              <div className="comic-kicker">Crew HQ</div>
              <h1 className="bangers hero-title" style={{ margin: 0, fontSize: 46 }}>🧭 Run the whole crew in one place.</h1>
              <p style={{ margin: 0, maxWidth: 900, color: "#555", lineHeight: 1.6, fontWeight: 800 }}>
                Join the crew, see everyone, plan hangouts, vote, and handle invites here.
              </p>
            </div>
          </section>

          {notice ? (
            <div className="card" style={{ background: "#fff5e6" }}>
              <strong>{notice}</strong>
            </div>
          ) : null}

          <div className="layout">
            <aside className="sidebar-stack">
              <div className="card">
                <h2 className="panel-title">Your Crews</h2>
                <div style={{ display: "grid", gap: 12 }}>
                  {groups.map((group, index) => (
                    <div
                      key={group.id}
                      className={`crew-card ${selectedGroup?.id === group.id ? "active" : ""}`}
                      onClick={() => setSelectedGroupId(group.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && setSelectedGroupId(group.id)}
                    >
                      <div className="crew-card-top">
                        <div className="crew-card-meta">
                          <strong className="bangers" style={{ display: "block", fontSize: 20 }}>{group.name}</strong>
                          <span className="crew-card-summary">
                            {group.members.length} member{group.members.length === 1 ? "" : "s"} · {group.hangoutProposals?.length || 0} hangout{(group.hangoutProposals?.length || 0) === 1 ? "" : "s"}
                          </span>
                        </div>
                        <span className="crew-card-badge" style={{ background: GROUP_COLORS[index % GROUP_COLORS.length] }}>
                          {selectedGroup?.id === group.id ? "OPEN" : "CREW"}
                        </span>
                      </div>
                    </div>
                  ))}
                  {!groups.length ? <p style={{ margin: 0, color: "#667085" }}>No crews yet. Start one from the Create Crew page.</p> : null}
                </div>
              </div>
            </aside>

            <section className="detail-stack">
              {selectedGroup ? (
                  <div className="card">
                    <div className="crew-header">
                      <div className="crew-header-top">
                        <div className="crew-header-meta">
                        <h2 className="bangers" style={{ margin: "0 0 8px", fontSize: 30 }}>{selectedGroup.name}</h2>
                        <p style={{ margin: 0, color: "#667085" }}>{selectedGroup.members.length} members · crew code {selectedGroup.code}</p>
                        </div>
                        <div className="crew-header-actions">
                          <div className="crew-header-stats">
                          <span className="stat-chip" style={{ background: "#eefdf5", color: "#0f766e" }}>{selectedGroup.hangoutProposals?.length || 0} active hangouts</span>
                          <span className="stat-chip" style={{ background: "#fff5e6", color: "#9a6700" }}>{selectedGroup.members.length} crew members</span>
                          </div>
                          <div className="crew-header-buttons">
                          <button
                            type="button"
                            className="btn secondary crew-action-btn"
                            style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 14 }}
                            onClick={() => leaveGroup()}
                          >
                            Leave crew
                          </button>
                          {isCurrentMemberAdmin ? (
                            <button
                              type="button"
                              className="btn crew-action-btn"
                              style={{ background: "#b42318", color: "#fff", borderColor: "#7a1610", boxShadow: "4px 4px 0 #7a1610", fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 14 }}
                              onClick={() => deleteGroup()}
                            >
                              Delete crew
                            </button>
                          ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="content-divider" style={{ margin: "22px 0 18px" }} />
                    <div className="tab-row">
                      {["Hangouts", "Members", "Invites", "Debrief", "Expenses"].map((tab) => (
                        <button key={tab} type="button" className={`tab-btn ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
                          {tab}
                        </button>
                      ))}
                    </div>
                    <div className="section-divider" style={{ marginTop: 20 }} />

                  {activeTab === "Hangouts" ? (
                    <div className="section-grid" style={{ marginTop: 20 }}>
                      <div className="vote-grid">
                        {selectedGroup.hangoutProposals?.length ? selectedGroup.hangoutProposals.map((proposal) => {
                          const topTime = pickWinner(proposal.timeOptions, proposal.votes?.time);
                          const topLocation = pickWinner(proposal.locationOptions, proposal.votes?.location);
                          return (
                            <div key={proposal.id} className="proposal-card">
                              <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap", marginBottom: 12 }}>
                                <div>
                                  <strong className="bangers" style={{ display: "block", fontSize: 22 }}>{proposal.name}</strong>
                                  <span style={{ color: "#667085", fontWeight: 700 }}>
                                    {proposal.proposerName === currentName ? "Started by you" : `Started by ${proposal.proposerName}`}
                                  </span>
                                </div>
                                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
                                  <span className="stat-chip" style={{ padding: "8px 12px", background: proposal.status === "finalized" ? "#eefdf5" : "#fff5e6", color: proposal.status === "finalized" ? "#0f766e" : "#9a6700" }}>{proposal.status}</span>
                                  <button type="button" className="btn ghost" style={{ padding: "8px 12px", fontSize: 13 }} onClick={() => startEditingProposal(proposal)}>
                                    Plan together
                                  </button>
                                  {(proposal.proposerName === currentName || isCurrentMemberAdmin) ? (
                                    <>
                                      <button
                                        type="button"
                                        className="btn"
                                        style={{ padding: "8px 12px", fontSize: 13, background: "#b42318", color: "#fff", borderColor: "#7a1610", boxShadow: "3px 3px 0 #7a1610" }}
                                        onClick={() => deleteProposal(proposal)}
                                      >
                                        Delete hangout
                                      </button>
                                    </>
                                  ) : null}
                                </div>
                              </div>
                              <p style={{ margin: "0 0 12px", color: "#475467" }}>{proposal.description || "No extra description added."}</p>
                              <div className="proposal-meta">
                                <span className="stat-chip" style={{ padding: "8px 12px", background: "#eef8ff", color: "#155e75" }}>
                                  Duration: {formatDurationHours(proposal.durationHours || ((proposal.durationMinutes || 0) ? proposal.durationMinutes / 60 : null))}
                                </span>
                              </div>
                              {proposal.agenda?.length ? (
                                <div style={{ margin: "12px 0 0", display: "grid", gap: 8, padding: 14, borderRadius: 14, border: "2px dashed rgba(23,21,31,0.18)", background: "#fffdf7" }}>
                                  <strong className="bangers" style={{ fontSize: 16 }}>Shared run of show</strong>
                                  {proposal.agenda.map((item) => (
                                    <div key={item.id} style={{ color: "#475467", fontWeight: 700 }}>
                                      {item.section}{item.time ? ` · ${item.time}` : ""}: {item.title}
                                    </div>
                                  ))}
                                </div>
                              ) : null}
                              {proposal.planningDetails?.meetingPoint || proposal.planningDetails?.reservationName || proposal.planningDetails?.followUpNotes ? (
                                <div style={{ margin: "12px 0 0", display: "grid", gap: 6, padding: 14, borderRadius: 14, border: "2px dashed rgba(23,21,31,0.18)", background: "#fffdf7" }}>
                                  <strong className="bangers" style={{ fontSize: 16 }}>Shared planning notes</strong>
                                  {proposal.planningDetails?.reservationName ? (
                                    <div style={{ color: "#475467", fontWeight: 700 }}>Reservation: {proposal.planningDetails.reservationName}</div>
                                  ) : null}
                                  {proposal.planningDetails?.meetingPoint ? (
                                    <div style={{ color: "#475467", fontWeight: 700 }}>Meet at: {proposal.planningDetails.meetingPoint}</div>
                                  ) : null}
                                  {proposal.planningDetails?.followUpNotes ? (
                                    <div style={{ color: "#475467", fontWeight: 700 }}>Notes: {proposal.planningDetails.followUpNotes}</div>
                                  ) : null}
                                </div>
                              ) : null}
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
                              <div className="proposal-footer">
                                <div style={{ color: "#667085", fontWeight: 700 }}>
                                  Top time: {topTime?.label || "No votes yet"}<br />
                                  Top place: {topLocation?.label || "No votes yet"}
                                </div>
                                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                  <span className="stat-chip" style={{ background: "#eef8ff", color: "#155e75" }}>{proposal.participants?.length || 0} crew member{(proposal.participants?.length || 0) === 1 ? "" : "s"}</span>
                                  {proposal.status !== "finalized" ? <button type="button" className="btn secondary" onClick={() => finalizeProposal(proposal)}>Finalize leading pick</button> : null}
                                </div>
                              </div>
                            </div>
                          );
                        }) : (
                          <div className="proposal-card empty">
                            <strong>No hangouts yet.</strong>
                            <p style={{ margin: "8px 0 0", color: "#667085" }}>Any member can start one from the hangout screen.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}

                  {activeTab === "Members" ? (
                    <div className="section-grid" style={{ marginTop: 20 }}>
                      <div className="section-header">
                        <h3 className="bangers" style={{ margin: 0, fontSize: 24 }}>Crew members</h3>
                        <p className="section-copy">See who is in the room, what role they have, and whether their availability is ready for planning.</p>
                      </div>
                      <div className="member-list">
                        {selectedGroup.members.map((member, memberIndex) => (
                          <div key={memberIdentityKey(member, memberIndex)} className="member-row">
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                              <div>
                                <strong style={{ display: "block" }}>{member.name}</strong>
                                <span style={{ color: "#667085", fontWeight: 700 }}>{member.role || "Member"} {member.username ? `· ${member.username}` : ""}</span>
                              </div>
                              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                                <span style={{ borderRadius: 999, padding: "8px 12px", background: hasAvailability(member.availability) ? "#eefdf5" : "#fff5e6", color: hasAvailability(member.availability) ? "#0f766e" : "#9a6700", fontWeight: 700 }}>
                                  {hasAvailability(member.availability) ? "Availability set" : "Availability missing"}
                                </span>
                                <button
                                  type="button"
                                  className="btn ghost"
                                  onClick={() => onNavigate?.("profile", profileRouteParamsForMember(member, selectedGroup.id))}
                                >
                                  View profile
                                </button>
                              </div>
                            </div>
                            <p style={{ margin: "10px 0 0", color: "#667085" }}>
                              {hasAvailability(member.availability) ? (
                                <span style={{ display: "grid", gap: 3 }}>
                                  {availabilityToText(member.availability).split(" • ").map((line, i) => (
                                    <span key={i} style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#166534", background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 7, padding: "3px 9px", width: "fit-content" }}>{line}</span>
                                  ))}
                                </span>
                              ) : (
                                <span style={{ fontSize: 13, fontWeight: 700, color: "#9a6700" }}>
                                  Availability will show once this member sets it in their profile.
                                </span>
                              )}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {activeTab === "Invites" ? (
                    <div className="section-grid" style={{ marginTop: 20 }}>
                      <div className="section-header">
                        <h3 className="bangers" style={{ margin: 0, fontSize: 24 }}>Crew invites</h3>
                        <p className="section-copy">Share the crew code or link. Anyone who uses it joins the crew instantly.</p>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", padding: "18px 20px", background: "#ffd93d", border: "4px solid #1a1a2e", borderRadius: 16, boxShadow: "5px 5px 0 #1a1a2e", marginBottom: 22 }}>
                        <div>
                          <p className="bangers" style={{ margin: "0 0 4px", fontSize: 13, letterSpacing: "0.12em", color: "#6b5a00" }}>YOUR CREW CODE</p>
                          <p className="bangers" style={{ margin: 0, fontSize: 42, letterSpacing: "0.22em", color: "#1a1a2e", lineHeight: 1 }}>{selectedGroup.code}</p>
                          <p style={{ margin: "6px 0 0", fontSize: 12, fontWeight: 800, color: "#6b5a00" }}>Share this code or the link below so someone can join the crew.</p>
                        </div>
                        <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
                          <button
                            type="button"
                            className="btn ghost"
                            style={{ whiteSpace: "nowrap" }}
                            onClick={() => void copyTextWithAlert(selectedGroup.code, "Crew code copied.")}
                          >
                            Copy code
                          </button>
                          <button
                            type="button"
                            className="btn ghost"
                            style={{ whiteSpace: "nowrap" }}
                            onClick={() => void copyTextWithAlert(buildGroupInviteLink(selectedGroup.code), "Crew invite link copied.")}
                          >
                            Copy link
                          </button>
                        </div>
                      </div>

                      <div className="invite-link-box">
                        <strong>Share this invite link</strong>
                        <div className="invite-link-value">{buildGroupInviteLink(selectedGroup.code)}</div>
                        <p style={{ margin: 0, color: "#667085", fontWeight: 800, lineHeight: 1.5 }}>
                          Send this link to someone so they can join the crew directly.
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                        <button type="button" className="btn primary" onClick={copyCrewInviteLink}>Copy crew invite link</button>
                      </div>
                      <div className="invite-link-box" style={{ marginTop: 16 }}>
                        <strong>Email this invite</strong>
                        <input
                          type="email"
                          value={inviteEmail}
                          onChange={(event) => setInviteEmail(event.target.value)}
                          onKeyDown={(event) => event.key === "Enter" && void sendCrewInviteEmail()}
                          placeholder="friend@example.com"
                          style={{
                            width: "100%",
                            border: "3px solid #1a1a2e",
                            borderRadius: 10,
                            padding: "10px 12px",
                            font: "800 14px 'Nunito', sans-serif",
                            background: "#fffdf7",
                          }}
                        />
                        <button
                          type="button"
                          className="btn secondary"
                          onClick={() => void sendCrewInviteEmail()}
                          disabled={isSendingInviteEmail}
                        >
                          {isSendingInviteEmail ? "Sending..." : "Send invite email"}
                        </button>
                      </div>
                      <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
                        <div className="pending-row" style={{ display: "grid", gap: 10 }}>
                          <strong>Declines</strong>
                          {pendingDeclines.length ? pendingDeclines.map((item) => (
                            <div key={item.id} className="invite-link-box" style={{ marginTop: 0 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                                <div>
                                  <strong>{item.name || item.username || "Unknown user"}</strong>
                                  <div style={{ color: "#667085", fontWeight: 800 }}>
                                    {item.username || "No username"} · declined {item.createdAt ? new Date(item.createdAt).toLocaleString() : "recently"}
                                  </div>
                                </div>
                                <button type="button" className="btn ghost" style={{ padding: "8px 12px", fontSize: 13 }} onClick={() => void clearPendingInviteNote(item.id)}>Clear</button>
                              </div>
                              <div className="invite-link-value">{item.clarification || "No clarification given."}</div>
                            </div>
                          )) : <div style={{ color: "#667085", fontWeight: 800 }}>No decline notes yet.</div>}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {activeTab === "Debrief" ? (
                    <div className="section-grid" style={{ marginTop: 20 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap", marginBottom: 20 }}>
                        <div>
                          <h3 className="bangers" style={{ margin: "0 0 6px", fontSize: 24 }}>Debrief Court ❤️</h3>
                          <p className="section-copy">Open your crew's case room when something needs honesty, repair, or a peace-maker vote.</p>
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
                    </div>
                  ) : null}

                  {activeTab === "Expenses" ? (
                    <div className="section-grid" style={{ marginTop: 20 }}>
                      <div className="section-header">
                        <h3 className="bangers" style={{ margin: 0, fontSize: 24 }}>Shared Expenses</h3>
                        <p className="section-copy">Anyone in the crew can add expenses, and everyone in the crew can see the same running totals and balances.</p>
                      </div>
                      <div className="bill-card" style={{ display: "grid", gap: 14 }}>
                        <strong style={{ fontSize: 20 }}>Everyone can log what they bought.</strong>
                        <p style={{ margin: 0, color: "#667085", fontWeight: 700 }}>
                          There is no separate record-keeper role anymore. Once an expense is added in Bill Split, everyone in {selectedGroup.name} sees it.
                        </p>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                          <button type="button" className="btn primary" onClick={() => onNavigate?.("bill-split")}>Open Bill Split</button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                  </div>
              ) : (
                <div className="card">
                  <strong>No crew selected.</strong>
                  <p style={{ margin: "8px 0 0", color: "#667085" }}>Pick one of your crews, or open Create Crew to start or join one.</p>
                  <button type="button" className="btn primary" style={{ marginTop: 14 }} onClick={() => onNavigate?.("create-crew")}>Open Create Crew</button>
                </div>
              )}
            </section>
          </div>
        </div>
        </OutsidersSideNav>
        {editingProposal ? (
          <div className="edit-modal-overlay" onClick={closeEditProposal}>
            <div className="edit-modal" onClick={(event) => event.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
                <div>
                  <div className="comic-kicker">Edit Hangout</div>
                  <h2 className="bangers" style={{ margin: "12px 0 0", fontSize: 34 }}>Update the plan</h2>
                </div>
                <button type="button" className="btn ghost" onClick={closeEditProposal}>Close</button>
              </div>

              <div className="field">
                <label>Hangout name</label>
                <input value={editDraft.name} onChange={(event) => setEditDraft((prev) => ({ ...prev, name: event.target.value }))} />
              </div>
              <div className="field">
                <label>Description</label>
                <textarea value={editDraft.description} onChange={(event) => setEditDraft((prev) => ({ ...prev, description: event.target.value }))} />
              </div>
              <div className="field">
                <label>Duration in hours</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={editDraft.durationHours}
                  onChange={(event) => setEditDraft((prev) => ({ ...prev, durationHours: event.target.value }))}
                  placeholder="Flexible"
                />
              </div>

              <div className="field">
                <label>Time options</label>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <input value={editDraft.newTime} onChange={(event) => setEditDraft((prev) => ({ ...prev, newTime: event.target.value }))} placeholder="Fri · 7:00 PM" />
                  <button type="button" className="btn secondary" onClick={addEditTimeOption}>Add time</button>
                </div>
              </div>
              <div className="edit-list">
                {editDraft.timeOptions.map((option) => (
                  <div key={option.id} className="edit-row">
                    <span>{option.label}</span>
                    <button type="button" className="btn ghost" style={{ padding: "7px 10px", fontSize: 12 }} onClick={() => setEditDraft((prev) => ({ ...prev, timeOptions: prev.timeOptions.filter((item) => item.id !== option.id) }))}>Remove</button>
                  </div>
                ))}
              </div>

              <div className="field">
                <label>Place options</label>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <input value={editDraft.newLocation} onChange={(event) => setEditDraft((prev) => ({ ...prev, newLocation: event.target.value }))} placeholder="Pizza spot, rooftop, game bar..." />
                  <button type="button" className="btn secondary" onClick={addEditLocationOption}>Add place</button>
                </div>
              </div>
              <div className="edit-list">
                {editDraft.locationOptions.map((option) => (
                  <div key={option.id} className="edit-row">
                    <span>{option.label}</span>
                    <button type="button" className="btn ghost" style={{ padding: "7px 10px", fontSize: 12 }} onClick={() => setEditDraft((prev) => ({ ...prev, locationOptions: prev.locationOptions.filter((item) => item.id !== option.id) }))}>Remove</button>
                  </div>
                ))}
              </div>
              <div className="field">
                <label>Reservation status</label>
                <select
                  value={editDraft.planningDetails.reservationStatus}
                  onChange={(event) => setEditDraft((prev) => ({
                    ...prev,
                    planningDetails: { ...prev.planningDetails, reservationStatus: event.target.value },
                  }))}
                >
                  <option value="not-needed">No reservation needed</option>
                  <option value="needed">Need to book</option>
                  <option value="booked">Booked already</option>
                </select>
              </div>
              <div className="field">
                <label>Reservation name</label>
                <input
                  value={editDraft.planningDetails.reservationName}
                  onChange={(event) => setEditDraft((prev) => ({
                    ...prev,
                    planningDetails: { ...prev.planningDetails, reservationName: event.target.value },
                  }))}
                  placeholder="Venue or reservation name"
                />
              </div>
              <div className="field">
                <label>Meeting point</label>
                <input
                  value={editDraft.planningDetails.meetingPoint}
                  onChange={(event) => setEditDraft((prev) => ({
                    ...prev,
                    planningDetails: { ...prev.planningDetails, meetingPoint: event.target.value },
                  }))}
                  placeholder="Where should everyone meet first?"
                />
              </div>
              <div className="field">
                <label>Shared notes</label>
                <textarea
                  value={editDraft.planningDetails.followUpNotes}
                  onChange={(event) => setEditDraft((prev) => ({
                    ...prev,
                    planningDetails: { ...prev.planningDetails, followUpNotes: event.target.value },
                  }))}
                  placeholder="Parking, arrival details, what to bring, backup plan..."
                />
              </div>

              <div className="field">
                <label>Shared run of show</label>
                <p style={{ margin: 0, color: "#667085", fontWeight: 700 }}>Everyone in the crew can keep shaping this plan together.</p>
              </div>
              <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                <input
                  value={editDraft.newAgendaSection}
                  onChange={(event) => setEditDraft((prev) => ({ ...prev, newAgendaSection: event.target.value }))}
                  placeholder="Section name"
                />
                <input
                  value={editDraft.newAgendaTime}
                  onChange={(event) => setEditDraft((prev) => ({ ...prev, newAgendaTime: event.target.value }))}
                  placeholder="Time"
                />
              </div>
              <div className="field">
                <input
                  value={editDraft.newAgendaTitle}
                  onChange={(event) => setEditDraft((prev) => ({ ...prev, newAgendaTitle: event.target.value }))}
                  placeholder="Agenda title"
                />
              </div>
              <div className="field">
                <textarea
                  value={editDraft.newAgendaNotes}
                  onChange={(event) => setEditDraft((prev) => ({ ...prev, newAgendaNotes: event.target.value }))}
                  placeholder="What happens in this step?"
                />
              </div>
              <button type="button" className="btn secondary" onClick={addEditAgendaStep}>Add agenda step</button>
              <div className="edit-list">
                {editDraft.agenda.length ? editDraft.agenda.map((item) => (
                  <div key={item.id} className="edit-row" style={{ alignItems: "stretch", display: "grid", gap: 8 }}>
                    <input
                      value={item.section || ""}
                      onChange={(event) => setEditDraft((prev) => ({
                        ...prev,
                        agenda: prev.agenda.map((entry) => entry.id === item.id ? { ...entry, section: event.target.value } : entry),
                      }))}
                      placeholder="Section"
                    />
                    <input
                      value={item.time || ""}
                      onChange={(event) => setEditDraft((prev) => ({
                        ...prev,
                        agenda: prev.agenda.map((entry) => entry.id === item.id ? { ...entry, time: event.target.value } : entry),
                      }))}
                      placeholder="Time"
                    />
                    <input
                      value={item.title || ""}
                      onChange={(event) => setEditDraft((prev) => ({
                        ...prev,
                        agenda: prev.agenda.map((entry) => entry.id === item.id ? { ...entry, title: event.target.value } : entry),
                      }))}
                      placeholder="Title"
                    />
                    <textarea
                      value={item.notes || ""}
                      onChange={(event) => setEditDraft((prev) => ({
                        ...prev,
                        agenda: prev.agenda.map((entry) => entry.id === item.id ? { ...entry, notes: event.target.value } : entry),
                      }))}
                      placeholder="Notes"
                    />
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <button
                        type="button"
                        className="btn ghost"
                        style={{ padding: "7px 10px", fontSize: 12 }}
                        onClick={() => setEditDraft((prev) => ({ ...prev, agenda: prev.agenda.filter((entry) => entry.id !== item.id) }))}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="edit-row"><span>No shared agenda steps yet.</span></div>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, flexWrap: "wrap" }}>
                <button type="button" className="btn ghost" onClick={closeEditProposal}>Cancel</button>
                <button type="button" className="btn primary" onClick={saveEditedProposal}>Save changes</button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
