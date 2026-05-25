import { DEFAULT_AVAILABILITY, hasAvailability, normalizeAvailability } from "./scheduling";

export const PROFILE_STORAGE_KEY = "outsiders-profile";

export const DEFAULT_PROFILE = {
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

export function getCurrentUserKey(profile = {}) {
  if (profile?.username) return `username:${String(profile.username).replace(/^@/, "").toLowerCase()}`;
  if (profile?.name) return `name:${String(profile.name).trim().toLowerCase()}`;
  return "local:you";
}

export function getDisplayName(profile = {}) {
  return profile?.name?.trim() || profile?.username?.replace(/^@/, "") || "You";
}

export function isProfileMemberOfGroup(group = {}, profile = {}) {
  const displayName = getDisplayName(profile);
  const username = profile?.username ? `@${String(profile.username).replace(/^@/, "")}` : "";
  return (group?.members || []).some((member) => (
    member?.name === displayName
    || (username && member?.username === username)
  ));
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
    inviteCode: trip.inviteCode || trip.invite_code || "",
    savingsProgress: Array.isArray(trip.savingsProgress) ? trip.savingsProgress : (Array.isArray(trip.savings_progress) ? trip.savings_progress : []),
    planningChecklist: Array.isArray(trip.planningChecklist) ? trip.planningChecklist : (Array.isArray(trip.planning_checklist) ? trip.planning_checklist : []),
    itinerarySuggestions: Array.isArray(trip.itinerarySuggestions) ? trip.itinerarySuggestions : (Array.isArray(trip.itinerary_suggestions) ? trip.itinerary_suggestions : []),
  };
}

function normalizeGroup(group = {}) {
  return {
    ...group,
    billWatch: group.billWatch || group.bill_watch || group.billWatch || {},
    peaceMaker: group.peaceMaker || group.peace_maker || group.peaceMaker || {},
    members: Array.isArray(group.members) ? group.members : [],
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
    groupId: notification.groupId || null,
    groupName: notification.groupName || "",
    proposalId: notification.proposalId || null,
    proposalCode: notification.proposalCode || "",
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

export function normalizeAppData(appData = {}) {
  const storedProfile = readStoredProfile();
  const nextProfile = {
    ...DEFAULT_PROFILE,
    ...storedProfile.profile,
    ...(appData.profile || {}),
    availability: normalizeAvailability(
      appData?.profile?.availability || storedProfile.profile.availability || DEFAULT_AVAILABILITY
    ),
  };

  const normalizedGroups = Array.isArray(appData.groups) ? appData.groups.map(normalizeGroup) : [];
  const derivedHangouts = normalizedGroups.flatMap((group) => (group.hangoutProposals || []).map((proposal) => ({
    ...proposal,
    groupId: proposal.groupId || group.id,
    groupName: proposal.groupName || group.name,
  })));

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
