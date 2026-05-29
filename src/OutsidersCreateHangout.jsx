import { useEffect, useMemo, useState } from "react";
import { createId, getCurrentUserKey, getDisplayName, getVisibleGroupsForProfile } from "./appState";
import { sendNotificationEmails } from "./notificationEmail";
import OutsidersSideNav from "./OutsidersSideNav";
import { getSiteUrl } from "./siteConfig";
import { availabilityToText, formatTimeLabel, recommendHangoutTimes } from "./scheduling";
import { hydrateMembersWithProfileLinks, isSupabaseConfigured, supabase } from "./supabase";

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
  .agenda-workspace {
    display: grid;
    grid-template-columns: minmax(260px, 320px) minmax(0, 1fr);
    gap: 16px;
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
  .planner-flow {
    display: grid;
    gap: 18px;
  }
  .planner-section-card {
    border: 3px solid #17151f;
    border-radius: 20px;
    background: linear-gradient(180deg, #fffdf7 0%, #fff7e3 100%);
    box-shadow: 4px 4px 0 #17151f;
    padding: 18px;
    display: grid;
    gap: 16px;
  }
  .planner-section-head {
    display: grid;
    gap: 8px;
  }
  .planner-action-row {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    align-items: center;
  }
  .member-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
  .choice-columns {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }
  .share-summary-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px 18px;
  }
  .share-summary-item {
    margin: 0;
    color: #667085;
    font-weight: 700;
  }
  .share-summary-item strong {
    display: block;
    margin-bottom: 4px;
    color: #17151f;
  }
  .section-divider {
    height: 3px;
    border-radius: 999px;
    background: rgba(23, 21, 31, 0.08);
    margin: 4px 0;
  }
  .section-copy {
    margin: 0 0 14px;
    color: #667085;
    line-height: 1.55;
    font-weight: 700;
  }
  .planner-collapsible {
    border: 3px solid #17151f;
    border-radius: 18px;
    background: #fff8e6;
    box-shadow: 4px 4px 0 #17151f;
    padding: 14px 16px 16px;
  }
  .planner-collapsible summary {
    cursor: pointer;
    list-style: none;
    font: 400 22px 'Bangers', cursive;
    letter-spacing: 0.04em;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .planner-collapsible summary::-webkit-details-marker {
    display: none;
  }
  .planner-collapsible summary span {
    color: #667085;
    font: 800 13px 'Nunito', sans-serif;
    letter-spacing: 0;
    text-transform: none;
  }
  .planner-collapsible-body {
    display: grid;
    gap: 14px;
    margin-top: 14px;
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
    .layout, .form-grid, .agenda-workspace {
      grid-template-columns: 1fr;
    }
    .member-grid, .choice-columns, .share-summary-grid {
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

function formatDurationHours(value) {
  if (!Number.isFinite(value) || value <= 0) return "Flexible";
  return `${value} hour${value === 1 ? "" : "s"}`;
}

function notificationRecipientKey(member = {}) {
  if (member.userId) return `user:${member.userId}`;
  if (member.username) return `username:${String(member.username).replace(/^@/, "").toLowerCase()}`;
  return `name:${String(member.name || "").trim().toLowerCase()}`;
}

async function requestHangoutAgendaSuggestions(payload) {
  const response = await fetch("/api/hangout-itinerary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hangout: payload }),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result?.error || "We could not build hangout ideas right now.");
  }
  return Array.isArray(result?.agendaSuggestions) ? result.agendaSuggestions : [];
}

export default function OutsidersCreateHangout({ onNavigate, appData, setAppData }) {
  const profile = useMemo(() => appData?.profile || {}, [appData?.profile]);
  const profileName = profile.name || profile.username || "You";
  const [currentUserId, setCurrentUserId] = useState(null);
  const effectiveProfile = useMemo(
    () => ({
      ...profile,
      id: profile.id || currentUserId || "",
    }),
    [currentUserId, profile]
  );
  const groups = useMemo(
    () => getVisibleGroupsForProfile(appData?.groups || [], effectiveProfile),
    [appData?.groups, effectiveProfile]
  );
  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id || "");
  const [form, setForm] = useState({
    name: "",
    description: "",
    manualDate: "",
    manualTime: "",
    manualLocation: "",
    reservationStatus: "no",
    reservationName: "",
    meetingPoint: "",
    followUpNotes: "",
  });
  const [duration, setDuration] = useState("");
  const [timeOptions, setTimeOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [agenda, setAgenda] = useState([]);
  const [agendaSuggestions, setAgendaSuggestions] = useState([]);
  const [agendaError, setAgendaError] = useState("");
  const [isGeneratingAgenda, setIsGeneratingAgenda] = useState(false);
  const [createdProposal, setCreatedProposal] = useState(null);
  const [isCreatingProposal, setIsCreatingProposal] = useState(false);
  const [error, setError] = useState("");

  const selectedGroup = groups.find((group) => String(group.id) === String(selectedGroupId)) || groups[0] || null;
  useEffect(() => {
    if (!groups.length && selectedGroupId) {
      queueMicrotask(() => setSelectedGroupId(""));
      return;
    }
    if (groups.length && (!selectedGroupId || !groups.some((group) => String(group.id) === String(selectedGroupId)))) {
      queueMicrotask(() => setSelectedGroupId(groups[0].id));
    }
  }, [groups, selectedGroupId]);
  const participants = useMemo(() => selectedGroup?.members ?? [], [selectedGroup]);
  const participantPool = useMemo(() => (
    participants.map((member) => ({
      id: memberKey(member),
      name: member.name,
      availability: member.availability || null,
    }))
  ), [participants]);

  const parsedDurationHours = duration === "" ? null : Number(duration);
  const hasCustomDuration = Number.isFinite(parsedDurationHours) && parsedDurationHours > 0;
  const durationHours = hasCustomDuration ? parsedDurationHours : null;
  const durationMinutes = hasCustomDuration ? Math.max(30, Math.round(parsedDurationHours * 60)) : 120;

  const recommendations = useMemo(
    () => recommendHangoutTimes(participantPool, { durationMinutes }),
    [durationMinutes, participantPool]
  );

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;
    let active = true;

    async function loadCurrentUser() {
      const { data: userData } = await supabase.auth.getUser();
      let resolvedUserId = userData?.user?.id || null;

      if (!resolvedUserId) {
        const { data: sessionData } = await supabase.auth.getSession();
        resolvedUserId = sessionData?.session?.user?.id || null;
      }

      if (!active) return;

      setCurrentUserId(resolvedUserId);
      if (resolvedUserId && !profile.id) {
        setAppData?.((prev) => ({
          ...prev,
          profile: {
            ...prev.profile,
            id: resolvedUserId,
          },
        }));
      }
    }

    void loadCurrentUser();
    return () => {
      active = false;
    };
  }, [profile.id, setAppData]);

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

  const generateAgenda = async () => {
    setAgendaError("");
    setIsGeneratingAgenda(true);
    try {
      const nextSuggestions = await requestHangoutAgendaSuggestions({
        name: form.name.trim(),
        description: form.description.trim(),
        timeOptions,
        locationOptions,
        externalInvites: [],
        planningDetails: {
          reservationStatus: form.reservationStatus,
          reservationName: form.reservationName.trim(),
          meetingPoint: form.meetingPoint.trim(),
          followUpNotes: form.followUpNotes.trim(),
        },
      });
      setAgendaSuggestions(nextSuggestions.map((item, index) => ({
        ...item,
        id: item.id || createId(`agenda-suggestion-${index}`),
        added: false,
      })));
    } catch (nextError) {
      setAgendaError(nextError.message || "We could not build hangout ideas right now.");
    } finally {
      setIsGeneratingAgenda(false);
    }
  };

  const addAgendaSuggestion = (suggestion) => {
    setAgenda((prev) => [...prev, {
      id: createId("agenda"),
      section: suggestion.section || "Main plan",
      time: suggestion.time || "",
      title: suggestion.title || "Hangout step",
      notes: suggestion.notes || "",
      source: "ai",
    }]);
    setAgendaSuggestions((prev) => prev.map((item) => item.id === suggestion.id ? { ...item, added: true } : item));
  };

  const addManualAgendaStep = () => {
    if (!form.manualTime || !form.followUpNotes.trim()) return;
    setAgenda((prev) => [...prev, {
      id: createId("agenda"),
      section: "Custom",
      time: form.manualTime,
      title: form.followUpNotes.trim().slice(0, 42),
      notes: form.followUpNotes.trim(),
      source: "manual",
    }]);
  };

  const createProposal = async () => {
    if (isCreatingProposal) return;
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

    setIsCreatingProposal(true);
    setError("");

    try {
      const proposal = {
        id: createId("proposal"),
        name: form.name.trim(),
        description: form.description.trim(),
        durationHours,
        durationMinutes: durationHours ? durationMinutes : null,
        groupId: selectedGroup.id,
        groupName: selectedGroup.name,
        status: "proposed",
        createdAt: new Date().toISOString(),
        proposerName: getDisplayName(profile),
        proposerKey: getCurrentUserKey(profile),
        timeOptions,
        locationOptions,
        votes: { availability: {}, vibe: {}, time: {}, location: {} },
        participants,
        externalInvites: [],
        recommendations,
        agenda,
        agendaSuggestions: [],
        planningDetails: {
          reservationStatus: form.reservationStatus,
          reservationName: form.reservationName.trim(),
          meetingPoint: form.meetingPoint.trim(),
          followUpNotes: form.followUpNotes.trim(),
        },
        finalizedChoice: null,
        ratings: [],
      };

      let nextGroupMembers = selectedGroup.members || [];
      if (isSupabaseConfigured) {
        const hydrated = await hydrateMembersWithProfileLinks(nextGroupMembers);
        nextGroupMembers = hydrated.members;
      }

      // Notify every crew member so the live notification feed records the hangout for the whole crew.
      const memberNotifications = nextGroupMembers
        .map((member) => ({
          id: createId("note"),
          userId: member.userId || null,
          type: "hangout-created",
          message: `${getDisplayName(profile)} shared a new hangout in ${selectedGroup.name}: ${proposal.name}.`,
          groupId: selectedGroup.id,
          groupName: selectedGroup.name,
          proposalId: proposal.id,
          recipient: member.name,
          recipientKey: notificationRecipientKey(member),
          actionScreen: "friend-groups",
          actionParams: { groupId: selectedGroup.id, tab: "Hangouts" },
          createdAt: new Date().toISOString(),
          read: false,
        }));
      const nextGroupProposalList = [...(selectedGroup.hangoutProposals || []), proposal];
      const nextGroup = {
        ...selectedGroup,
        members: nextGroupMembers,
        hangoutProposals: nextGroupProposalList,
      };

      if (isSupabaseConfigured && selectedGroup?.id) {
        const { error: groupError } = await supabase
          .from("groups")
          .update({ members: nextGroupMembers, hangout_proposals: nextGroupProposalList })
          .eq("id", selectedGroup.id);

        if (groupError) {
          const isNetworkError = /load failed|failed to fetch|network/i.test(groupError.message || "");
          setError(
            isNetworkError
              ? "Couldn't reach the server. Check your connection and try again."
              : groupError.message || "We could not save that hangout yet."
          );
          return;
        }

        if (memberNotifications.length) {
          const { error: notificationError } = await supabase
            .from("notifications")
            .insert(
              memberNotifications
                .filter((item) => item.userId)
                .map((item) => ({
                  user_id: item.userId,
                  recipient: item.recipient,
                  recipient_key: item.recipientKey,
                  group_id: item.groupId,
                  group_name: item.groupName,
                  proposal_id: item.proposalId,
                  action_screen: item.actionScreen,
                  action_params: item.actionParams,
                  type: item.type,
                  message: item.message,
                  read: false,
                }))
            );

          if (notificationError) {
            console.warn("Hangout notifications did not fully save:", notificationError.message);
          }
        }

        try {
          await sendNotificationEmails({
            recipients: nextGroupMembers.filter((member) => member.email).map((member) => ({ email: member.email, name: member.name })),
            subject: `${getDisplayName(profile)} created a new hangout in ${selectedGroup.name}`,
            intro: `${getDisplayName(profile)} just created "${proposal.name}" in ${selectedGroup.name}.`,
            ctaLabel: "Open crew hangouts",
            ctaUrl: `${getSiteUrl()}/#/friend-groups`,
            details: [
              `Crew: ${selectedGroup.name}`,
              `Time options: ${proposal.timeOptions.length}`,
              `Place options: ${proposal.locationOptions.length}`,
            ],
          });
        } catch (emailError) {
          console.warn("Hangout email notifications did not fully send:", emailError.message);
        }
      }

      setAppData?.((prev) => ({
        ...prev,
        groups: prev.groups.map((group) => (
          group.id === selectedGroup.id
            ? nextGroup
            : group
        )),
        hangouts: [...(prev.hangouts || []), proposal],
        // When Supabase is configured, Realtime delivers notifications instantly — no optimistic push needed
        // (avoids duplicates). Without Supabase the notification list stays empty, which is correct since
        // there's no backend to deliver them from.
        notifications: prev.notifications || [],
      }));

      setCreatedProposal({
        ...proposal,
        groupName: selectedGroup.name,
      });
      setError("");
    } catch (err) {
      const isNetworkError = /load failed|failed to fetch|network/i.test(err?.message || "");
      setError(
        isNetworkError
          ? "Couldn't reach the server. Check your connection and try again."
          : err?.message || "Something went wrong. Please try again."
      );
    } finally {
      setIsCreatingProposal(false);
    }
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="root">
        <OutsidersSideNav activeLabel="Create Hangout" onNavigate={onNavigate} profileName={profileName} notificationCount={(appData?.notifications || []).filter((n) => !n.read).length} appData={appData} setAppData={setAppData}>
        <div className="shell">
          {!createdProposal ? (
            <section className="planner-board">
              <div className="planner-hero">
                <div className="comic-kicker">Hangout Planner</div>
                <h1 className="planner-title">Pitch The Next Hangout.</h1>
                <p className="planner-subtitle">
                  Pick the crew, add a few time and place choices, and let everyone vote.
                </p>
              </div>
              <div className="card" style={{ maxWidth: 980, margin: "0 auto" }}>
                <div className="card-header">
                  <div>
                    <h2 className="section-title" style={{ marginBottom: 6 }}>Planner Setup</h2>
                    <p style={{ margin: 0, color: "#556077", lineHeight: 1.6 }}>
                      Start with the basics, add a few choices, then share it with the crew.
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

                <div className="section-block planner-flow">
                  <div className="planner-section-card">
                    <div className="planner-section-head">
                      <h3 className="section-title" style={{ fontSize: 22, marginBottom: 0 }}>1. Core Details</h3>
                      <p className="section-copy" style={{ marginBottom: 0 }}>Pick the crew, name the hangout, and decide who this plan is for.</p>
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
                        <label>What is this hangout?</label>
                        <textarea value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} placeholder="Drop the vibe, dress code, and what makes this one worth voting for." />
                      </div>
                    </div>
                    <div style={{ display: "grid", gap: 12 }}>
                      <strong style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: "0.06em" }}>Who gets this hangout</strong>
                      <p style={{ margin: "0 0 2px", color: "#667085" }}>Everyone in this crew gets the hangout automatically. No extra invitations are needed.</p>
                      <div className="member-grid">
                        {participants.length ? participants.map((member) => (
                          <div key={memberKey(member)} className="crew-member active" style={{ cursor: "default" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                              <strong>{member.name}</strong>
                              <span style={{ color: "#0f766e", fontWeight: 700 }}>Included</span>
                            </div>
                            <p style={{ margin: "8px 0 0", color: "#667085", textAlign: "left" }}>{availabilityToText(member.availability)}</p>
                          </div>
                        )) : (
                          <p style={{ margin: 0, color: "#667085" }}>Create or join a crew first.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="section-divider" />

                  <div className="planner-section-card">
                    <div className="planner-section-head">
                      <h3 className="section-title" style={{ fontSize: 22, marginBottom: 0 }}>2. Vote Choices</h3>
                      <p className="section-copy" style={{ marginBottom: 0 }}>Give the crew a few time and place options to vote on. You only need at least one of each to post.</p>
                    </div>
                    <div className="choice-columns">
                      <div style={{ display: "grid", gap: 14 }}>
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
                        <div className="planner-action-row">
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
                      <div style={{ display: "grid", gap: 14 }}>
                        <div className="form-grid">
                          <div className="field">
                            <label>Location idea</label>
                            <input value={form.manualLocation} onChange={(event) => setForm((prev) => ({ ...prev, manualLocation: event.target.value }))} placeholder="Harbor rooftop, pizza spot, game bar..." />
                          </div>
                        </div>
                        <div className="planner-action-row">
                          <button type="button" className="btn secondary" onClick={addLocationOption}>Add place option</button>
                        </div>
                        <div className="pill-list">
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
                      </div>
                    </div>
                  </div>

                  <div className="section-divider" />

                  <div className="planner-section-card">
                    <details className="planner-collapsible">
                      <summary>
                        3. Smart Suggestions
                        <span>Optional: use saved availability and AI help</span>
                      </summary>
                      <div className="planner-collapsible-body">
                        <p className="field-note" style={{ margin: 0 }}>
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
                    </details>
                  </div>

                  <div className="section-divider" />

                  <div className="planner-section-card">
                    <details className="planner-collapsible">
                      <summary>
                        4. Day Plan
                        <span>Optional: add reservation notes and a simple run of show</span>
                      </summary>
                      <div className="planner-collapsible-body">
                        <div className="form-grid">
                          <div className="field">
                            <label>Any booking yet?</label>
                            <select value={form.reservationStatus} onChange={(event) => setForm((prev) => ({ ...prev, reservationStatus: event.target.value }))}>
                              <option value="no">Not yet</option>
                              <option value="yes">Yes, reserved</option>
                            </select>
                          </div>
                          <div className="field">
                            <label>Reservation Name</label>
                            <input value={form.reservationName} onChange={(event) => setForm((prev) => ({ ...prev, reservationName: event.target.value }))} placeholder="Optional venue or reservation name" />
                          </div>
                          <div className="field full">
                            <label>Meeting Point</label>
                            <input value={form.meetingPoint} onChange={(event) => setForm((prev) => ({ ...prev, meetingPoint: event.target.value }))} placeholder="Where should everyone meet first?" />
                          </div>
                          <div className="field full">
                            <label>Follow-up Notes</label>
                            <textarea value={form.followUpNotes} onChange={(event) => setForm((prev) => ({ ...prev, followUpNotes: event.target.value }))} placeholder="Anything the crew should know before the day comes?" />
                          </div>
                        </div>
                        <div className="agenda-workspace">
                          <div style={{ display: "grid", gap: 12 }}>
                            <div className="summary-box">
                              <strong style={{ display: "block", marginBottom: 8 }}>AI Suggestions</strong>
                              <p style={{ margin: 0, color: "#667085" }}>These stay separate until you choose which ones belong in your final hangout plan.</p>
                            </div>
                            {agendaError ? <p style={{ margin: 0, color: "#b42318", fontWeight: 700 }}>{agendaError}</p> : null}
                            <button type="button" className="btn secondary" onClick={() => void generateAgenda()} disabled={isGeneratingAgenda}>
                              {isGeneratingAgenda ? "Building hangout flow..." : "Build AI run of show"}
                            </button>
                            {agendaSuggestions.length ? agendaSuggestions.map((item) => (
                              <div key={item.id} className="summary-box">
                                <strong style={{ display: "block", marginBottom: 6 }}>{item.section} {item.time ? `· ${item.time}` : ""}</strong>
                                <div style={{ fontWeight: 800, marginBottom: 6 }}>{item.title}</div>
                                <p style={{ margin: "0 0 10px", color: "#667085" }}>{item.notes}</p>
                                <button type="button" className="btn ghost" disabled={item.added} onClick={() => addAgendaSuggestion(item)}>
                                  {item.added ? "Added to final plan" : "Add to final plan"}
                                </button>
                              </div>
                            )) : null}
                          </div>
                          <div style={{ display: "grid", gap: 12 }}>
                            <div className="summary-box">
                              <strong style={{ display: "block", marginBottom: 8 }}>Final Hangout Plan</strong>
                              <p style={{ margin: 0, color: "#667085" }}>This is the plan your crew will actually keep.</p>
                            </div>
                            {agenda.length ? agenda.map((item) => (
                              <div key={item.id} className="pill-list">
                                <strong>{item.section} {item.time ? `· ${item.time}` : ""}</strong>
                                <div style={{ fontWeight: 800, marginTop: 8 }}>{item.title}</div>
                                <p style={{ margin: "6px 0 0", color: "#667085" }}>{item.notes}</p>
                              </div>
                            )) : (
                              <div className="summary-box">
                                <strong>No final hangout plan yet.</strong>
                                <p style={{ margin: "8px 0 0", color: "#667085" }}>Add AI ideas you like, or turn your notes into a simple plan.</p>
                              </div>
                            )}
                            <button type="button" className="btn ghost" onClick={addManualAgendaStep}>
                              Add note as agenda step
                            </button>
                          </div>
                        </div>
                      </div>
                    </details>
                  </div>

                  <div className="section-divider" />

                  <div className="planner-section-card">
                    <div className="planner-section-head">
                      <h3 className="section-title" style={{ fontSize: 22, marginBottom: 0 }}>5. Share With Crew</h3>
                      <p className="section-copy" style={{ marginBottom: 0 }}>Quick check: if you have a crew, a name, one time option, and one place option, you’re ready.</p>
                    </div>
                    <div className="summary-box">
                      <div className="share-summary-grid">
                        <p className="share-summary-item"><strong>Crew</strong>{selectedGroup ? `${selectedGroup.emoji} ${selectedGroup.name}` : "No crew selected"}</p>
                        <p className="share-summary-item"><strong>Duration</strong>{formatDurationHours(durationHours)}</p>
                        <p className="share-summary-item"><strong>Vote setup</strong>{timeOptions.length} time options · {locationOptions.length} place options</p>
                        <p className="share-summary-item"><strong>Crew access</strong>Everyone in the crew gets this hangout automatically</p>
                        <p className="share-summary-item">{timeOptions.length ? "✓ Time options added" : "• Add at least one time option"}</p>
                        <p className="share-summary-item">{locationOptions.length ? "✓ Place options added" : "• Add at least one place option"}</p>
                        <p className="share-summary-item">{form.name.trim() ? "✓ Hangout name added" : "• Give the hangout a clear name"}</p>
                        <p className="share-summary-item">{selectedGroup ? "✓ Crew selected" : "• Make sure the right crew is selected"}</p>
                      </div>
                    </div>
                    {error ? <p style={{ margin: "14px 0 0", color: "#b42318", fontWeight: 700 }}>{error}</p> : null}
                    <button type="button" className="btn primary" style={{ width: "100%", marginTop: 16, opacity: isCreatingProposal ? 0.75 : 1 }} onClick={createProposal} disabled={isCreatingProposal}>
                      {isCreatingProposal ? "Sharing..." : "Share hangout with crew"}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <div className="card" style={{ maxWidth: 760, margin: "0 auto" }}>
              <div className="status-chip" style={{ background: "#eefdf5", color: "#0f766e" }}>Hangout Shared</div>
              <h1 className="bangers" style={{ margin: "14px 0 8px", fontSize: 42 }}>{createdProposal.name}</h1>
              <p style={{ margin: "0 0 16px", color: "#667085" }}>The crew can now vote on this hangout inside {createdProposal.groupName}. Notifications have been sent to the rest of the crew.</p>
              <div className="summary-box">
                <strong style={{ display: "block", marginBottom: 8 }}>Ready for crew voting</strong>
                <p style={{ margin: "0 0 10px", color: "#667085" }}>Duration: {formatDurationHours(createdProposal.durationHours)}</p>
                <p style={{ margin: 0, color: "#667085" }}>Everything now lives in the crew's hangout voting space.</p>
              </div>
              <div className="summary-box" style={{ marginTop: 14 }}>
                <strong style={{ display: "block", marginBottom: 8 }}>What to do next</strong>
                <p style={{ margin: "0 0 8px", color: "#667085" }}>1. Confirm the best time after voting.</p>
                <p style={{ margin: "0 0 8px", color: "#667085" }}>2. Share the meeting point and reservation details.</p>
                <p style={{ margin: 0, color: "#667085" }}>3. Open the crew page if you want to keep shaping the plan together.</p>
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
