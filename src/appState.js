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
  };
}

function normalizeGroup(group = {}) {
  return {
    ...group,
    members: Array.isArray(group.members) ? group.members : [],
    pending: Array.isArray(group.pending) ? group.pending : [],
    cases: Array.isArray(group.cases) ? group.cases : [],
    hangoutProposals: Array.isArray(group.hangoutProposals) ? group.hangoutProposals.map(normalizeProposal) : [],
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
    actionScreen: notification.actionScreen || "",
    actionParams: notification.actionParams && typeof notification.actionParams === "object" ? notification.actionParams : {},
    type: notification.type || "general",
    createdAt: notification.createdAt || new Date().toISOString(),
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

  return {
    groups: Array.isArray(appData.groups) ? appData.groups.map(normalizeGroup) : [],
    hangouts: Array.isArray(appData.hangouts) ? appData.hangouts.map(normalizeProposal) : [],
    trips: Array.isArray(appData.trips) ? appData.trips : [],
    profile: nextProfile,
    avatar: appData.avatar || storedProfile.avatar || null,
    notifications: Array.isArray(appData.notifications) ? appData.notifications.map(normalizeNotification) : [],
  };
}

export function profileNeedsAvailability(profile) {
  return !hasAvailability(profile?.availability);
}
