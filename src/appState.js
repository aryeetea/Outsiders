import { DEFAULT_AVAILABILITY, hasAvailability, normalizeAvailability } from "./scheduling";

export const PROFILE_STORAGE_KEY = "outsiders-profile";

export const DEFAULT_PROFILE = {
  id: "",
  name: "",
  username: "",
  bio: "",
  location: "",
  email: "",
  availability: DEFAULT_AVAILABILITY,
};

export function createId(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeUsername(value = "") {
  return String(value).replace(/^@/, "").trim().toLowerCase();
}

function normalizeName(value = "") {
  return String(value).trim().toLowerCase();
}

function normalizeEmail(value = "") {
  return String(value).trim().toLowerCase();
}

function getPossibleUserIds(value = {}) {
  return [
    value?.id,
    value?.userId,
    value?.user_id,
    value?.profileId,
    value?.profile_id,
    value?.uid,
  ]
    .map((item) => String(item || "").trim())
    .filter(Boolean);
}

export function getCurrentUserKey(profile = {}) {
  if (profile?.username) return `username:${normalizeUsername(profile.username)}`;
  if (profile?.name) return `name:${normalizeName(profile.name)}`;
  return "local:you";
}

export function getDisplayName(profile = {}) {
  return profile?.name?.trim() || profile?.username?.replace(/^@/, "") || "You";
}

export function isProfileMemberOfGroup(group = {}, profile = {}) {
  const currentUserIds = getPossibleUserIds(profile);
  const displayName = normalizeName(getDisplayName(profile));
  const username = normalizeUsername(profile?.username || "");
  const email = normalizeEmail(profile?.email || "");
  const members = group?.members || [];

  // The members array is the canonical list of who is currently in the crew.
  // Any user found here is considered active — whether they're admin, owner, etc.
  const isInMembers = members.some((member) => {
    const memberUserIds = getPossibleUserIds(member);
    return (
      (currentUserIds.length && memberUserIds.some((id) => currentUserIds.includes(id)))
      || (username && normalizeUsername(member?.username || "") === username)
      || (email && normalizeEmail(member?.email || "") === email)
      || (displayName && normalizeName(member?.name || "") === displayName)
    );
  });

  if (isInMembers) return true;

  // Owner fallback: treat the recorded owner as a member of the crew even if
  // their member JSON is temporarily out of sync. Leave flows transfer
  // ownership, so this stays accurate after someone intentionally leaves.
  const ownerIds = getPossibleUserIds({
    id: group?.owner_id || group?.ownerId,
    userId: group?.ownerUserId || group?.owner_user_id,
  });
  if (currentUserIds.length && ownerIds.some((id) => currentUserIds.includes(id))) {
    return true;
  }
  if (username && normalizeUsername(group?.owner_username || group?.ownerUsername || "") === username) {
    return true;
  }

  return false;
}

export function getVisibleGroupsForProfile(groups = [], profile = {}) {
  return (Array.isArray(groups) ? groups : []).filter((group) => isProfileMemberOfGroup(group, profile));
}

export function readStoredProfile() {
  if (typeof window === "undefined") {
    return { profile: DEFAULT_PROFILE, avatar: null };
  }

  try {
    const saved = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!saved) return { profile: DEFAULT_PROFILE, avatar: null };
    const parsed = JSON.parse(saved);
    return {
      profile: {
        ...DEFAULT_PROFILE,
        ...(parsed?.profile || {}),
        availability: normalizeAvailability(parsed?.profile?.availability || DEFAULT_PROFILE.availability),
      },
      avatar: typeof parsed?.avatar === "string" ? parsed.avatar : null,
    };
  } catch {
    return { profile: DEFAULT_PROFILE, avatar: null };
  }
}

export function persistStoredProfile(profile, avatar) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      PROFILE_STORAGE_KEY,
      JSON.stringify({
        profile: {
          ...DEFAULT_PROFILE,
          ...profile,
          availability: normalizeAvailability(profile?.availability || DEFAULT_AVAILABILITY),
        },
        avatar: avatar || null,
      })
    );
  } catch {
    // Ignore storage quota issues so profile saves do not fail if the browser cannot persist extras locally.
  }
}

function normalizeProposalVoteMap(votes) {
  return votes && typeof votes === "object" ? votes : {};
}

function normalizeProposal(proposal = {}) {
  return {
    id: proposal.id || createId("proposal"),
    name: proposal.name || "Untitled Hangout",
    description: proposal.description || "",
    groupId: proposal.groupId || null,
    groupName: proposal.groupName || "",
    status: proposal.status || "proposed",
    code: proposal.code || "",
    link: proposal.link || "",
    createdAt: proposal.createdAt || new Date().toISOString(),
    proposerName: proposal.proposerName || "Someone",
    proposerKey: proposal.proposerKey || "local:someone",
    timeOptions: Array.isArray(proposal.timeOptions) ? proposal.timeOptions : [],
    locationOptions: Array.isArray(proposal.locationOptions) ? proposal.locationOptions : [],
    votes: {
      availability: normalizeProposalVoteMap(proposal.votes?.availability),
      vibe: normalizeProposalVoteMap(proposal.votes?.vibe),
      time: normalizeProposalVoteMap(proposal.votes?.time),
      location: normalizeProposalVoteMap(proposal.votes?.location),
    },
    participants: Array.isArray(proposal.participants) ? proposal.participants : [],
    externalInvites: Array.isArray(proposal.externalInvites) ? proposal.externalInvites : [],
    recommendations: Array.isArray(proposal.recommendations) ? proposal.recommendations : [],
    agenda: Array.isArray(proposal.agenda) ? proposal.agenda : [],
    agendaSuggestions: Array.isArray(proposal.agendaSuggestions) ? proposal.agendaSuggestions : [],
    planningDetails: proposal.planningDetails && typeof proposal.planningDetails === "object" ? proposal.planningDetails : {},
    finalizedChoice: proposal.finalizedChoice || null,
    ratings: Array.isArray(proposal.ratings) ? proposal.ratings : [],
    location: proposal.location || proposal.finalizedChoice?.location?.label || proposal.finalizedChoice?.location || "",
    date: proposal.date || "",
  };
}

function normalizeTrip(trip = {}) {
  const normalizedItinerary = Array.isArray(trip.itinerary)
    ? trip.itinerary.map((day, index) => ({
      day: Number(day?.day) || index + 1,
      date: day?.date || "",
      activities: Array.isArray(day?.activities)
        ? day.activities.map((activity, activityIndex) => ({
          id: activity?.id || createId("activity"),
          time: activity?.time || "",
          name: activity?.name || "Trip plan",
          notes: activity?.notes || "",
          done: Boolean(activity?.done),
          source: activity?.source || "manual",
          suggestionId: activity?.suggestionId || "",
          order: Number(activity?.order) || activityIndex,
        }))
        : [],
    }))
    : [];

  return {
    ...trip,
    id: trip.id || createId("trip"),
    name: trip.name || "Untitled Trip",
    destination: trip.destination || "",
    startDate: trip.startDate || trip.start_date || "",
    endDate: trip.endDate || trip.end_date || "",
    budget: Number(trip.budget) || 0,
    spent: Number(trip.spent) || 0,
    members: Array.isArray(trip.members) ? trip.members : [],
    color: trip.color && typeof trip.color === "object" ? trip.color : { bg: "#fff4e6", border: "#ff9a3c", emoji: "🏝" },
    status: trip.status || "Planning",
    itinerary: normalizedItinerary,
    packingList: Array.isArray(trip.packingList) ? trip.packingList : (Array.isArray(trip.packing_list) ? trip.packing_list : []),
    ratings: Array.isArray(trip.ratings) ? trip.ratings : [],
    groupId: trip.groupId || trip.group_id || null,
    creatorId: trip.creatorId || trip.creator_id || null,
    inviteCode: "",
    savingsProgress: Array.isArray(trip.savingsProgress) ? trip.savingsProgress : (Array.isArray(trip.savings_progress) ? trip.savings_progress : []),
    planningChecklist: Array.isArray(trip.planningChecklist) ? trip.planningChecklist : (Array.isArray(trip.planning_checklist) ? trip.planning_checklist : []),
    itinerarySuggestions: Array.isArray(trip.itinerarySuggestions) ? trip.itinerarySuggestions : (Array.isArray(trip.itinerary_suggestions) ? trip.itinerary_suggestions : []),
    bookingInfo: trip.bookingInfo && typeof trip.bookingInfo === "object" ? trip.bookingInfo : (trip.booking_info && typeof trip.booking_info === "object" ? trip.booking_info : {}),
    tripPreferences: Array.isArray(trip.tripPreferences) ? trip.tripPreferences : (Array.isArray(trip.trip_preferences) ? trip.trip_preferences : []),
    hiddenFor: Array.isArray(trip.hiddenFor) ? trip.hiddenFor : (Array.isArray(trip.hidden_for) ? trip.hidden_for : []),
    groupSavingsGoal: Number(trip.groupSavingsGoal ?? trip.group_savings_goal) || Number(trip.budget) || 0,
    memberSavingsTargets: Array.isArray(trip.memberSavingsTargets) ? trip.memberSavingsTargets : (Array.isArray(trip.member_savings_targets) ? trip.member_savings_targets : []),
  };
}

function normalizeGroup(group = {}) {
  return {
    ...group,
    billWatch: group.billWatch || group.bill_watch || group.billWatch || {},
    peaceMaker: group.peaceMaker || group.peace_maker || group.peaceMaker || {},
    members: Array.isArray(group.members) ? group.members : [],
    expenses: Array.isArray(group.expenses) ? group.expenses : [],
    pending: Array.isArray(group.pending) ? group.pending : [],
    cases: Array.isArray(group.cases) ? group.cases : [],
    hangoutProposals: Array.isArray(group.hangoutProposals)
      ? group.hangoutProposals.map(normalizeProposal)
      : (Array.isArray(group.hangout_proposals) ? group.hangout_proposals.map(normalizeProposal) : []),
    roastBoard: Array.isArray(group.roastBoard) ? group.roastBoard : [],
  };
}

function normalizeNotification(notification = {}) {
  return {
    id: notification.id || createId("note"),
    message: notification.message || "",
    groupId: notification.groupId || notification.group_id || null,
    groupName: notification.groupName || notification.group_name || "",
    proposalId: notification.proposalId || notification.proposal_id || null,
    proposalCode: notification.proposalCode || notification.proposal_code || "",
    link: notification.link || "",
    recipient: notification.recipient || "",
    recipientKey: notification.recipientKey || notification.recipient_key || "",
    userId: notification.userId || notification.user_id || null,
    actionScreen: notification.actionScreen || notification.action_screen || "",
    actionParams: (notification.actionParams || notification.action_params) && typeof (notification.actionParams || notification.action_params) === "object"
      ? (notification.actionParams || notification.action_params)
      : {},
    type: notification.type || "general",
    createdAt: notification.createdAt || notification.created_at || new Date().toISOString(),
    read: Boolean(notification.read),
  };
}

export function getAllHangoutProposals(groups = [], hangouts = []) {
  const proposalsById = new Map();

  (Array.isArray(groups) ? groups : []).forEach((group) => {
    (group?.hangoutProposals || group?.hangout_proposals || []).forEach((proposal) => {
      if (!proposal?.id) return;
      proposalsById.set(String(proposal.id), normalizeProposal({
        ...proposal,
        groupId: proposal.groupId || group.id,
        groupName: proposal.groupName || group.name,
        groupEmoji: proposal.groupEmoji || group.emoji || "👥",
      }));
    });
  });

  (Array.isArray(hangouts) ? hangouts : []).forEach((proposal) => {
    if (!proposal?.id) return;
    const current = proposalsById.get(String(proposal.id)) || {};
    proposalsById.set(String(proposal.id), normalizeProposal({
      ...proposal,
      ...current,
      groupId: current.groupId || proposal.groupId || null,
      groupName: current.groupName || proposal.groupName || "",
      groupEmoji: current.groupEmoji || proposal.groupEmoji || "👥",
    }));
  });

  return Array.from(proposalsById.values()).sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );
}

export function getHangoutProposalByCode(groups = [], hangouts = [], code = "") {
  const normalizedCode = String(code || "").trim().toUpperCase();
  if (!normalizedCode) return null;
  return getAllHangoutProposals(groups, hangouts).find(
    (proposal) => String(proposal?.code || "").toUpperCase() === normalizedCode
  ) || null;
}

export function normalizeAppData(appData = {}, options = {}) {
  const storedProfile = options.useStoredProfile === false
    ? { profile: DEFAULT_PROFILE, avatar: null }
    : readStoredProfile();
  const nextProfile = {
    ...DEFAULT_PROFILE,
    ...storedProfile.profile,
    ...(appData.profile || {}),
    availability: normalizeAvailability(
      appData?.profile?.availability || storedProfile.profile.availability || DEFAULT_AVAILABILITY
    ),
  };

  const normalizedGroups = Array.isArray(appData.groups) ? appData.groups.map(normalizeGroup) : [];
  const derivedHangouts = getAllHangoutProposals(normalizedGroups, appData.hangouts || []);

  return {
    groups: normalizedGroups,
    hangouts: Array.isArray(appData.hangouts) ? appData.hangouts.map(normalizeProposal) : derivedHangouts,
    trips: Array.isArray(appData.trips) ? appData.trips.map(normalizeTrip) : [],
    profile: nextProfile,
    avatar: appData.avatar || storedProfile.avatar || null,
    notifications: Array.isArray(appData.notifications) ? appData.notifications.map(normalizeNotification) : [],
  };
}

export function profileNeedsAvailability(profile) {
  return !hasAvailability(profile?.availability);
}
