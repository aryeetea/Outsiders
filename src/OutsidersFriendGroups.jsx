import { useEffect, useMemo, useState } from "react";
import { createId, getCurrentUserKey, getDisplayName } from "./appState";
import OutsidersSideNav from "./OutsidersSideNav";
import { buildGroupInviteLink } from "./siteConfig";
import { availabilityToText, hasAvailability } from "./scheduling";

function profileRouteParamsForMember(member, groupId) {
  return {
    groupId: groupId ? String(groupId) : "",
    memberKey: member?.username ? `username:${String(member.username).replace(/^@/, "").toLowerCase()}` : `name:${String(member?.name || "").trim().toLowerCase()}`,
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

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function getInitials(name) {
  return (name || "You").replace(/^@/, "").trim().slice(0, 2).toUpperCase() || "YO";
}

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

export default function OutsidersFriendGroups({ onNavigate, appData, setAppData, routeParams }) {
  const profile = appData?.profile || {};
  const profileName = profile.name || profile.username || "You";
  const currentName = getDisplayName(profile);
  const currentUserKey = getCurrentUserKey(profile);
  const inviteCodeFromLink = String(routeParams?.groupCode || "").toUpperCase();
  const allGroups = useMemo(() => appData?.groups ?? [], [appData?.groups]);
  const groups = allGroups.filter((group) =>
    (group.members || []).some((m) => m.name === currentName || m.username === `@${profile.username}`)
  );
  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id || "");
  const [activeTab, setActiveTab] = useState("Hangouts");
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupEmoji, setNewGroupEmoji] = useState("👥");
  const [inviteUsername, setInviteUsername] = useState("");
  const [joinCode, setJoinCode] = useState(inviteCodeFromLink);
  const [billChecklistDraft, setBillChecklistDraft] = useState("");
  const [editingProposalId, setEditingProposalId] = useState(null);
  const [generatedInvite, setGeneratedInvite] = useState({ groupId: "", link: "" });
  const [editDraft, setEditDraft] = useState({
    name: "",
    description: "",
    durationHours: "",
    timeOptions: [],
    locationOptions: [],
    externalInvites: [],
    newTime: "",
    newLocation: "",
    newInvite: "",
  });
  const [notice, setNotice] = useState("");
  const selectedGroup = groups.find((group) => String(group.id) === String(selectedGroupId)) || groups[0] || null;
  const currentMember = selectedGroup?.members?.find((member) => member.name === currentName || member.username === `@${profile.username}`) || null;
  const isCurrentMemberAdmin = currentMember?.role === "Admin";
  const debriefCount = selectedGroup?.cases?.length || 0;
  const openDebriefCount = (selectedGroup?.cases || []).filter((caseItem) => caseItem.status !== "Resolved").length;
  const selectedBillWatch = selectedGroup?.billWatch || { electedMemberName: "", votes: {}, checklist: [] };
  const myBillWatchVote = selectedBillWatch.votes?.[currentUserKey] || "";
  const editingProposal = selectedGroup?.hangoutProposals?.find((proposal) => proposal.id === editingProposalId) || null;
  const generatedInviteLink = generatedInvite.groupId === selectedGroup?.id ? generatedInvite.link : "";

  useEffect(() => {
    if (!hasAvailability(profile.availability)) return;
    setAppData?.((prev) => {
      const needsSync = (prev.groups || []).some((group) =>
        (group.members || []).some((m) => {
          const isMe = m.name === currentName || m.username === `@${profile.username}`;
          return isMe && availabilityToText(m.availability) !== availabilityToText(profile.availability);
        })
      );
      if (!needsSync) return prev;
      return {
        ...prev,
        groups: (prev.groups || []).map((group) => ({
          ...group,
          members: (group.members || []).map((member) => {
            const isMe = member.name === currentName || member.username === `@${profile.username}`;
            return isMe ? { ...member, availability: profile.availability } : member;
          }),
        })),
      };
    });
  }, [currentName, profile.availability, profile.username, setAppData]);

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
        bio: profile.bio || "",
        location: profile.location || "",
        email: profile.email || "",
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
    const target = allGroups.find((group) => group.code === code);
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
                bio: profile.bio || "",
                location: profile.location || "",
                email: profile.email || "",
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
    const inviteLink = buildGroupInviteLink(selectedGroup.code);
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
      notifications: [
        ...(prev.notifications || []),
        {
          id: createId("note"),
          type: "crew-invite",
          message: `${username}, ${currentName} invited you to join ${selectedGroup.name}.`,
          groupId: selectedGroup.id,
          groupName: selectedGroup.name,
          link: inviteLink,
          recipient: username,
          actionScreen: "friend-groups",
          actionParams: { groupCode: selectedGroup.code },
          createdAt: new Date().toISOString(),
          read: false,
        },
      ],
    }));
    setInviteUsername("");
    setNotice(`${username} was added to pending invites.`);
  };

  const copyCrewInviteLink = async () => {
    if (!selectedGroup?.code) {
      setNotice("Pick a crew before copying an invite link.");
      return;
    }

    const inviteLink = buildGroupInviteLink(selectedGroup.code);
    setGeneratedInvite({ groupId: selectedGroup.id, link: inviteLink });
    try {
      if (window.navigator?.clipboard && window.isSecureContext) {
        await window.navigator.clipboard.writeText(inviteLink);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = inviteLink;
        textArea.setAttribute("readonly", "");
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        const copied = document.execCommand("copy");
        document.body.removeChild(textArea);
        if (!copied) throw new Error("Clipboard copy was blocked.");
      }
      setNotice(`Invite link generated and copied for ${selectedGroup.name}.`);
    } catch {
      setNotice("Invite link generated. Copy it from the box below.");
    }
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
          ? (() => {
              const currentVote = group.billWatch?.votes?.[currentUserKey];
              const nextVotes = { ...(group.billWatch?.votes || {}) };
              if (currentVote === memberName) {
                delete nextVotes[currentUserKey];
              } else {
                nextVotes[currentUserKey] = memberName;
              }
              const leader = getLeaderFromMemberVotes(group.members, nextVotes);
              return {
                ...group,
                billWatch: {
                  ...(group.billWatch || {}),
                  electedMemberName: leader?.isTie ? "" : (leader?.name || ""),
                  votes: nextVotes,
                },
              };
            })()
          : group
      )),
    }));
    setNotice(
      myBillWatchVote === memberName
        ? "You removed your Bill Watch vote."
        : `You picked ${memberName} for Bill Watch.`
    );
  };

  const addBillWatchChecklistItem = () => {
    if (!selectedGroup || !billChecklistDraft.trim()) return;
    const item = billChecklistDraft.trim();
    setAppData?.((prev) => ({
      ...prev,
      groups: prev.groups.map((group) => (
        group.id === selectedGroup.id
          ? {
              ...group,
              billWatch: {
                ...(group.billWatch || {}),
                checklist: (group.billWatch?.checklist || []).includes(item)
                  ? (group.billWatch?.checklist || [])
                  : [...(group.billWatch?.checklist || []), item],
              },
            }
          : group
      )),
    }));
    setBillChecklistDraft("");
    setNotice("Bill Watch checklist updated.");
  };

  const removeBillWatchChecklistItem = (item) => {
    if (!selectedGroup) return;
    setAppData?.((prev) => ({
      ...prev,
      groups: prev.groups.map((group) => (
        group.id === selectedGroup.id
          ? {
              ...group,
              billWatch: {
                ...(group.billWatch || {}),
                checklist: (group.billWatch?.checklist || []).filter((entry) => entry !== item),
              },
            }
          : group
      )),
    }));
    setNotice("Removed that Bill Watch checklist item.");
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
      newTime: "",
      newLocation: "",
      newInvite: "",
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
      newTime: "",
      newLocation: "",
      newInvite: "",
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

  const addEditExternalInvite = () => {
    const invite = editDraft.newInvite.trim();
    if (!invite) return;
    setEditDraft((prev) => ({
      ...prev,
      externalInvites: prev.externalInvites.includes(invite) ? prev.externalInvites : [...prev.externalInvites, invite],
      newInvite: "",
    }));
  };

  const saveEditedProposal = () => {
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
    const previousInvites = new Set(editingProposal.externalInvites || []);
    const newExternalInvites = editDraft.externalInvites.filter((invite) => !previousInvites.has(invite));

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
        votes: {
          ...(proposal.votes || {}),
          time: Object.fromEntries(Object.entries(proposal.votes?.time || {}).filter(([, value]) => allowedTimeIds.has(value))),
          location: Object.fromEntries(Object.entries(proposal.votes?.location || {}).filter(([, value]) => allowedLocationIds.has(value))),
        },
        updatedAt: new Date().toISOString(),
      };
    };

    const updateNotifications = [
      {
        id: createId("note"),
        type: "hangout-updated",
        message: `${editingProposal.name} was updated for ${selectedGroup.name}.`,
        groupId: selectedGroup.id,
        groupName: selectedGroup.name,
        proposalId: editingProposal.id,
        proposalCode: editingProposal.code,
        link: editingProposal.link,
        actionScreen: "join-hangout",
        actionParams: { code: editingProposal.code },
        createdAt: new Date().toISOString(),
        read: false,
      },
      ...newExternalInvites.map((invite) => ({
        id: createId("note"),
        type: "hangout-invite",
        message: `${invite}, you were invited to ${editDraft.name.trim()}.`,
        groupId: selectedGroup.id,
        groupName: selectedGroup.name,
        proposalId: editingProposal.id,
        proposalCode: editingProposal.code,
        link: editingProposal.link,
        recipient: invite,
        actionScreen: "join-hangout",
        actionParams: { code: editingProposal.code },
        createdAt: new Date().toISOString(),
        read: false,
      })),
    ];

    setAppData?.((prev) => ({
      ...prev,
      groups: (prev.groups || []).map((group) => (
        group.id === selectedGroup.id
          ? { ...group, hangoutProposals: (group.hangoutProposals || []).map(updateProposal) }
          : group
      )),
      hangouts: (prev.hangouts || []).map(updateProposal),
      notifications: [...(prev.notifications || []), ...updateNotifications],
    }));
    closeEditProposal();
    setNotice("Hangout updated.");
  };

  const deleteProposal = (proposal) => {
    if (!selectedGroup || !proposal) return;
    const canManageProposal = proposal.proposerName === currentName || isCurrentMemberAdmin;
    if (!canManageProposal) return;

    const confirmed = window.confirm(`Delete ${proposal.name}? This removes the planned hangout, votes, invite code, and related notifications.`);
    if (!confirmed) return;

    setAppData?.((prev) => ({
      ...prev,
      groups: (prev.groups || []).map((group) => (
        group.id === selectedGroup.id
          ? {
              ...group,
              hangoutProposals: (group.hangoutProposals || []).filter((item) => item.id !== proposal.id),
            }
          : group
      )),
      hangouts: (prev.hangouts || []).filter((item) => item.id !== proposal.id),
      notifications: (prev.notifications || []).filter((notification) => notification.proposalId !== proposal.id),
    }));

    if (editingProposalId === proposal.id) {
      closeEditProposal();
    }
    setNotice(`${proposal.name} was deleted.`);
  };

  const leaveGroup = (targetGroup = selectedGroup) => {
    if (!targetGroup) return;
    const member = targetGroup.members.find((m) => m.name === currentName || m.username === `@${profile.username}`);
    if (!member) return;
    const remainingMembers = targetGroup.members.filter((m) => m.name !== member.name && m.username !== member.username);

    if (!remainingMembers.length) {
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

    setAppData?.((prev) => ({
      ...prev,
      groups: (prev.groups || []).map((group) => {
        if (String(group.id) !== String(targetGroup.id)) return group;
        return {
          ...group,
          members: nextMembers,
          hangoutProposals: (group.hangoutProposals || []).map((proposal) => ({
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
              Object.entries(group.billWatch?.votes || {}).filter(([key, value]) => key !== currentUserKey && value !== member.name)
            );
            const leader = getLeaderFromMemberVotes(nextMembers, filteredVotes);
            return {
              ...(group.billWatch || {}),
              electedMemberName: leader?.isTie ? "" : (leader?.name || ""),
              votes: filteredVotes,
            };
          })(),
        };
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

  const deleteGroup = (targetGroup = selectedGroup) => {
    if (!targetGroup) return;
    const member = targetGroup.members.find((m) => m.name === currentName || m.username === `@${profile.username}`);
    if (member?.role !== "Admin") return;

    const confirmed = window.confirm(`Delete ${targetGroup.name} for everyone? This removes the whole crew and its proposals.`);
    if (!confirmed) return;

    setAppData?.((prev) => ({
      ...prev,
      groups: prev.groups.filter((group) => group.id !== targetGroup.id),
    }));
    setNotice(`${targetGroup.name} was deleted.`);
  };

  const billLeader = getLeaderFromMemberVotes(selectedGroup?.members || [], selectedBillWatch.votes || {});

  return (
    <>
      <style>{STYLES}</style>
      <div className="root">
        <OutsidersSideNav activeLabel="My Crew" onNavigate={onNavigate} profileName={profileName} notificationCount={(appData?.notifications || []).filter((n) => !n.read).length}>
        <div className="shell">
          <section className="glass hero">
              <div style={{ display: "grid", gap: 12 }}>
              <div className="comic-kicker">Crew HQ</div>
              <h1 className="bangers hero-title" style={{ margin: 0, fontSize: 46 }}>Keep your hangouts, votes, invites, and debriefs in one crew home.</h1>
              <p style={{ margin: 0, maxWidth: 900, color: "#555", lineHeight: 1.6, fontWeight: 800 }}>
                You can propose the next move, your crew can vote on time and place, and everyone can handle invites, money roles, and Debrief Court without leaving the group context.
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
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                        <div>
                          <strong className="bangers" style={{ display: "block", fontSize: 20 }}>{group.emoji} {group.name}</strong>
                          <span style={{ color: "#667085", fontWeight: 700 }}>{group.members.length} members · {group.hangoutProposals?.length || 0} hangouts</span>
                        </div>
                        <div style={{ width: 14, height: 14, borderRadius: 999, background: GROUP_COLORS[index % GROUP_COLORS.length] }} />
                      </div>
                    </div>
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
                      <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end" }}>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
                          <span className="stat-chip" style={{ background: "#eefdf5", color: "#0f766e" }}>{selectedGroup.hangoutProposals?.length || 0} active hangouts</span>
                          <span className="stat-chip" style={{ background: "#fff5e6", color: "#9a6700" }}>{selectedGroup.pending?.length || 0} pending invites</span>
                        </div>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
                          <button
                            type="button"
                            className="btn secondary"
                            style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 14 }}
                            onClick={() => leaveGroup()}
                          >
                            Leave crew
                          </button>
                          {isCurrentMemberAdmin ? (
                            <button
                              type="button"
                              className="btn"
                              style={{ background: "#b42318", color: "#fff", borderColor: "#7a1610", boxShadow: "4px 4px 0 #7a1610", fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 14 }}
                              onClick={() => deleteGroup()}
                            >
                              Delete crew
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="content-divider" style={{ margin: "22px 0 18px" }} />
                    <div className="tab-row">
                      {["Hangouts", "Members", "Invites", "Debrief", "Bill Watch"].map((tab) => (
                        <button key={tab} type="button" className={`tab-btn ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>

                  {activeTab === "Hangouts" ? (
                    <div className="card">
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap", marginBottom: 20 }}>
                        <div>
                          <h3 className="bangers" style={{ margin: "0 0 6px", fontSize: 24 }}>Crew hangouts</h3>
                          <p className="section-copy">Every crew member can see and vote on each hangout below. Each card separates the basics, the vote choices, and the current leader so it is easier to read.</p>
                        </div>
                        <button type="button" className="btn primary" onClick={() => onNavigate?.("create-hangout")}>Start a hangout</button>
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
                                  <span style={{ color: "#667085", fontWeight: 700 }}>
                                    {proposal.proposerName === currentName ? "Started by you" : `Started by ${proposal.proposerName}`}
                                  </span>
                                </div>
                                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
                                  <span className="stat-chip" style={{ padding: "8px 12px", background: proposal.status === "finalized" ? "#eefdf5" : "#fff5e6", color: proposal.status === "finalized" ? "#0f766e" : "#9a6700" }}>{proposal.status}</span>
                                  {(proposal.proposerName === currentName || isCurrentMemberAdmin) ? (
                                    <>
                                      <button type="button" className="btn ghost" style={{ padding: "8px 12px", fontSize: 13 }} onClick={() => startEditingProposal(proposal)}>
                                        Edit hangout
                                      </button>
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
                                  <span className="stat-chip" style={{ background: "#eef8ff", color: "#155e75" }}>{proposal.externalInvites?.length || 0} outside invite{proposal.externalInvites?.length === 1 ? "" : "s"}</span>
                                  {proposal.status !== "finalized" ? <button type="button" className="btn secondary" onClick={() => finalizeProposal(proposal)}>Finalize leading pick</button> : null}
                                </div>
                              </div>
                            </div>
                          );
                        }) : (
                          <div className="proposal-card">
                            <strong>No hangouts yet.</strong>
                            <p style={{ margin: "8px 0 0", color: "#667085" }}>Any member can start one from the hangout screen.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}

                  {activeTab === "Members" ? (
                    <div className="card">
                      <div className="section-header">
                        <h3 className="bangers" style={{ margin: 0, fontSize: 24 }}>Crew members</h3>
                        <p className="section-copy">See who is in the room, what role they have, and whether their availability is ready for planning.</p>
                      </div>
                      <div className="member-list">
                        {selectedGroup.members.map((member) => (
                          <div key={`${member.name}-${member.username || ""}`} className="member-row">
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
                            <p style={{ margin: "10px 0 0", color: "#667085" }}>{availabilityToText(member.availability)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {activeTab === "Invites" ? (
                    <div className="card">
                      <div className="section-header">
                        <h3 className="bangers" style={{ margin: 0, fontSize: 24 }}>Crew invites</h3>
                        <p className="section-copy">Invite people, copy the crew link, and keep pending invites separate from the rest of the page.</p>
                      </div>
                      <div className="field">
                        <label>Invite username</label>
                        <input value={inviteUsername} onChange={(event) => setInviteUsername(event.target.value)} placeholder="theirusername" />
                      </div>
                      <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                        <button type="button" className="btn primary" onClick={inviteMember}>Add pending invite</button>
                        <button type="button" className="btn ghost" onClick={copyCrewInviteLink}>Generate & copy invite link</button>
                      </div>
                      {generatedInviteLink ? (
                        <div className="invite-link-box">
                          <strong>Share this crew invite link</strong>
                          <div className="invite-link-value">{generatedInviteLink}</div>
                          <p style={{ margin: 0, color: "#667085", fontWeight: 800, lineHeight: 1.5 }}>
                            Send this link to someone so they can open Outsiders with this crew code ready to join.
                          </p>
                        </div>
                      ) : null}
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
                      <div className="roast-card">
                        <strong style={{ display: "block", marginBottom: 8 }}>Why Debrief instead</strong>
                        <p style={{ margin: 0, color: "#555", lineHeight: 1.6, fontWeight: 800 }}>
                          Debrief Court already gives you anonymous case filing, replies, apologies, clap-backs, and a crew-voted peace-maker bench. It fits the comic personality of the site better than a separate roast board, so this page points you back there instead.
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {activeTab === "Bill Watch" ? (
                    <div className="card">
                      <div className="section-header">
                        <h3 className="bangers" style={{ margin: 0, fontSize: 24 }}>Bill Watch</h3>
                        <p className="section-copy">Pick who you trust to track who paid, keep the split clean, and stay on top of balances. The summary stays at the top, votes stay in the left column, and the checklist stays on the right.</p>
                      </div>
                      <div className="summary-grid" style={{ marginBottom: 18 }}>
                        <div className="summary-card" style={{ background: "#eef8ff" }}>
                          <p className="bangers" style={{ fontSize: 15, margin: "0 0 6px" }}>Your vote</p>
                          <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "#155e75" }}>
                            {myBillWatchVote || "Not picked yet"}
                          </p>
                        </div>
                        <div className="summary-card" style={{ background: "#fff5e6" }}>
                          <p className="bangers" style={{ fontSize: 15, margin: "0 0 6px" }}>Current leader</p>
                          <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "#9a6700" }}>
                            {billLeader?.isTie ? "Tie vote" : (billLeader?.name || "No leader yet")}
                          </p>
                        </div>
                        <div className="summary-card" style={{ background: "#eefdf5" }}>
                          <p className="bangers" style={{ fontSize: 15, margin: "0 0 6px" }}>Votes cast</p>
                          <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "#0f766e" }}>
                            {Object.keys(selectedBillWatch.votes || {}).length}
                          </p>
                        </div>
                      </div>
                      <div className="bill-watch-shell">
                        <div className="bill-watch-main">
                          <div className="vote-grid">
                            {selectedGroup.members.map((member) => {
                              const totalVotes = countMemberVotes(selectedBillWatch.votes, member.name);
                              const isMine = myBillWatchVote === member.name;
                              return (
                                <div key={member.name} className={`bill-card ${isMine ? "active" : ""}`}>
                                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                                    <div>
                                      <strong style={{ display: "block", fontSize: 18 }}>{member.name}</strong>
                                      <div className="bill-vote-meta">
                                        <span className="mini-pill">{totalVotes} vote{totalVotes === 1 ? "" : "s"}</span>
                                        {isMine ? <span className="mini-pill" style={{ background: "#e8fde8", color: "#0f766e" }}>Your pick</span> : null}
                                      </div>
                                    </div>
                                    <button type="button" className={`btn ${isMine ? "ghost" : "secondary"}`} onClick={() => castBillWatchVote(member.name)}>
                                      {isMine ? "Remove my vote" : "Vote for this person"}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <div className="bill-watch-side">
                          <div className="checklist-panel">
                            <div>
                              <strong style={{ display: "block", marginBottom: 6 }}>Bill Watch checklist</strong>
                              <p style={{ margin: 0, color: "#667085", fontWeight: 700 }}>Set the handoff so whoever wins knows exactly what your crew expects.</p>
                            </div>
                            <div className="field">
                              <label>Add a responsibility</label>
                              <input
                                value={billChecklistDraft}
                                onChange={(event) => setBillChecklistDraft(event.target.value)}
                                placeholder="Example: Post Venmo reminders by Sunday night"
                              />
                            </div>
                            <button type="button" className="btn secondary" onClick={addBillWatchChecklistItem}>
                              Add checklist item
                            </button>
                          </div>
                          <div className="vote-grid">
                            {(selectedBillWatch.checklist || []).length ? selectedBillWatch.checklist.map((item) => (
                              <div key={item} className="checklist-item">
                                <span style={{ fontWeight: 800, color: "#475467" }}>{item}</span>
                                <button type="button" className="btn ghost" style={{ padding: "8px 10px", fontSize: 13 }} onClick={() => removeBillWatchChecklistItem(item)}>
                                  Remove
                                </button>
                              </div>
                            )) : (
                              <div className="bill-card">
                                <strong>No checklist yet.</strong>
                                <p style={{ margin: "8px 0 0", color: "#667085" }}>Add a few expectations so your Bill Watch pick knows what your crew wants covered.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
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
                <label>Outside invites</label>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <input value={editDraft.newInvite} onChange={(event) => setEditDraft((prev) => ({ ...prev, newInvite: event.target.value }))} placeholder="name, @handle, or phone note" />
                  <button type="button" className="btn secondary" onClick={addEditExternalInvite}>Add invite</button>
                </div>
              </div>
              <div className="edit-list">
                {editDraft.externalInvites.length ? editDraft.externalInvites.map((invite) => (
                  <div key={invite} className="edit-row">
                    <span>{invite}</span>
                    <button type="button" className="btn ghost" style={{ padding: "7px 10px", fontSize: 12 }} onClick={() => setEditDraft((prev) => ({ ...prev, externalInvites: prev.externalInvites.filter((item) => item !== invite) }))}>Remove</button>
                  </div>
                )) : (
                  <div className="edit-row"><span>No outside invites yet.</span></div>
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
