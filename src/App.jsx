import { Component, useEffect, useRef, useState } from "react";
import {
  DEFAULT_PROFILE,
  isProfileMemberOfGroup,
  normalizeAppData,
  persistStoredProfile,
  profileNeedsAvailability,
} from "./appState";
import OutsidersBillSplit from "./OutsidersBillSplit";
import OutsidersCreateHangout from "./OutsidersCreateHangout";
import OutsidersCreateCrew from "./OutsidersCreateCrew";
import OutsidersDashboard from "./OutsidersDashboard";
import OutsidersDebrief from "./OutsidersDebrief";
import OutsidersFriendGroups from "./OutsidersFriendGroups";
import OutsidersHangouts from "./OutsidersHangouts";
import OutsidersLanding from "./OutsidersLanding";
import OutsidersLogIn from "./OutsidersLogIn";
import OutsidersAccountDeleted from "./OutsidersAccountDeleted";
import OutsidersProfile from "./OutsidersProfile";
import OutsidersRateOuting from "./OutsidersRateOuting";
import OutsidersSignUp from "./Outsiderssignup";
import OutsidersTripPlanning from "./OutsidersTripPlanning";
import OutsidersVoting from "./OutsidersVoting";
import {
  clearSupabaseAuthStorage,
  ensureCurrentUserProfile,
  hydrateMembersWithProfileLinks,
  isSupabaseConfigured,
  supabase,
} from "./supabase";
import Outsiders3DBackground from "./Outsiders3DBackground";
import OutsidersConfettiBackground from "./OutsidersConfettiBackground";

const DEFAULT_SCREEN = "landing";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 16,
          fontFamily: "'Nunito', sans-serif",
          background: "#fffdf9",
          padding: 24,
          textAlign: "center",
        }}>
          <div style={{
            width: 56, height: 56, background: "#d98b7f",
            border: "4px solid #1a1a2e", borderRadius: 14,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, boxShadow: "4px 4px 0 #1a1a2e",
          }}>⚡</div>
          <h2 style={{ margin: 0, fontFamily: "'Bangers', cursive", fontSize: 36, letterSpacing: "0.04em", color: "#1a1a2e" }}>
            Something went wrong
          </h2>
          <p style={{ margin: 0, color: "#667085", fontWeight: 700, maxWidth: 400 }}>
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              marginTop: 8, padding: "12px 28px",
              background: "#d98b7f", color: "#fff",
              border: "3px solid #1a1a2e", borderRadius: 10,
              fontFamily: "'Bangers', cursive", fontSize: 20,
              letterSpacing: "0.06em", cursor: "pointer",
              boxShadow: "4px 4px 0 #1a1a2e",
            }}
          >
            Refresh page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}


const APP_DATA_STORAGE_KEY = "outsiders-app-data";
const LAST_APP_ROUTE_STORAGE_KEY = "outsiders-last-app-route";
const SHARED_DATA_REFRESH_EVENT = "outsiders:shared-data-refresh";
const PUBLIC_SCREENS = new Set(["landing", "login", "signup", "account-deleted"]);
const AVAILABILITY_FRIENDLY_SCREENS = new Set(["profile"]);

const SCREEN_COMPONENTS = {
  "landing": OutsidersLanding,
  "login": OutsidersLogIn,
  "signup": OutsidersSignUp,
  "account-deleted": OutsidersAccountDeleted,
  "dashboard": OutsidersDashboard,
  "hangouts": OutsidersHangouts,
  "create-hangout": OutsidersCreateHangout,
  "create-crew": OutsidersCreateCrew,
  "voting": OutsidersVoting,
  "friend-groups": OutsidersFriendGroups,
  "trip-planning": OutsidersTripPlanning,
  "bill-split": OutsidersBillSplit,
  "rate-outing": OutsidersRateOuting,
  "debrief": OutsidersDebrief,
  "profile": OutsidersProfile,
};

function normalizeScreen(screen) {
  const next = (screen || "").replace(/^#\/?/, "").split("?")[0].trim();
  return SCREEN_COMPONENTS[next] ? next : DEFAULT_SCREEN;
}

function getRouteFromLocation() {
  if (typeof window === "undefined") {
    return { screen: DEFAULT_SCREEN, params: {} };
  }

  const rawHash = window.location.hash.replace(/^#\/?/, "");
  const [hashScreen = "", hashQuery = ""] = rawHash.split("?");
  const params = Object.fromEntries(new URLSearchParams(hashQuery));
  return { screen: normalizeScreen(hashScreen), params };
}

function getInitialAppData() {
  if (typeof window === "undefined") return normalizeAppData({ profile: DEFAULT_PROFILE });

  try {
    const saved = window.localStorage.getItem(APP_DATA_STORAGE_KEY);
    if (!saved) return normalizeAppData({});
    return normalizeAppData(JSON.parse(saved));
  } catch {
    return normalizeAppData({});
  }
}

function mergeGroupsByIdentity(primaryGroups = [], secondaryGroups = []) {
  const merged = new Map();

  [...(Array.isArray(secondaryGroups) ? secondaryGroups : []), ...(Array.isArray(primaryGroups) ? primaryGroups : [])].forEach((group) => {
    if (!group) return;
    const idKey = String(group.id || "").trim();
    const codeKey = String(group.code || "").trim().toUpperCase();
    const key = idKey || (codeKey ? `code:${codeKey}` : "");
    if (!key) return;
    merged.set(key, group);
  });

  return Array.from(merged.values());
}

export default function App() {
  const [route, setRoute] = useState(getRouteFromLocation);
  const [appData, setAppData] = useState(getInitialAppData);
  const [toast, setToast] = useState(null);
  const [sessionReady, setSessionReady] = useState(!isSupabaseConfigured);
  const [currentSession, setCurrentSession] = useState(null);
  const latestAppDataRef = useRef(appData);

async function fetchSharedAppData(user, previousAppData = {}) {
    const ensuredProfile = await ensureCurrentUserProfile(user);
    if (ensuredProfile?.error) {
      console.warn("[Outsiders] Could not fully repair new-user profile:", ensuredProfile.error.message);
    }

    const { data: profileRow } = await supabase
      .from("profiles")
      .select("full_name, username, email, availability, avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    const hydratedProfile = {
      id: user.id,
      name: profileRow?.full_name || user.user_metadata?.full_name || "",
      username: profileRow?.username || user.user_metadata?.username || "",
      email: profileRow?.email || user.email || "",
      bio: user.user_metadata?.bio || "",
      location: user.user_metadata?.location || "",
      availability: profileRow?.availability || user.user_metadata?.availability || DEFAULT_PROFILE.availability,
    };

    const { data: rawGroupRows, error: groupRowsError } = await supabase
      .from("groups")
      .select("*");
    const { data: notificationRows, error: notificationRowsError } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    const { data: tripRows, error: tripRowsError } = await supabase
      .from("trips")
      .select("*")
      .order("created_at", { ascending: false });

    const groupRows = !groupRowsError && Array.isArray(rawGroupRows)
      ? await Promise.all(rawGroupRows.map(async (group) => {
        const { members, changed } = await hydrateMembersWithProfileLinks(group.members || []);
        return { ...group, members, _membersChanged: changed };
      }))
      : [];

    const changedGroupRows = groupRows.filter((group) => group?._membersChanged && group?.id);
    if (changedGroupRows.length) {
      await Promise.all(
        changedGroupRows.map((group) => supabase
          .from("groups")
          .update({ members: group.members })
          .eq("id", group.id))
      );
    }

    const sharedGroups = !groupRowsError && Array.isArray(groupRows)
      ? groupRows.filter((group) => isProfileMemberOfGroup(group, hydratedProfile))
      : null;
    const fallbackGroups = (Array.isArray(previousAppData.groups) ? previousAppData.groups : []).filter((group) => (
      isProfileMemberOfGroup(group, hydratedProfile)
    ));
    const effectiveGroups = Array.isArray(sharedGroups)
      ? mergeGroupsByIdentity(sharedGroups, fallbackGroups)
      : fallbackGroups;
    const sharedGroupIds = Array.isArray(effectiveGroups) ? effectiveGroups.map((group) => String(group.id)) : [];
    const hydratedHangouts = Array.isArray(effectiveGroups)
      ? effectiveGroups.flatMap((group) => (group.hangout_proposals || group.hangoutProposals || []).map((proposal) => ({
        ...proposal,
        groupId: proposal.groupId || group.id,
        groupName: proposal.groupName || group.name,
      })))
      : previousAppData.hangouts;
    const sharedHangouts = Array.from(
      new Map(
        [...(Array.isArray(previousAppData.hangouts) ? previousAppData.hangouts : []), ...(hydratedHangouts || [])]
          .map((proposal) => [String(proposal?.id || ""), proposal])
      ).values()
    ).filter((proposal) => proposal?.id);
    const sharedTrips = !tripRowsError && Array.isArray(tripRows)
      ? tripRows.filter((trip) => (
        (String(trip.creator_id) === String(user.id)
        || (trip.group_id && sharedGroupIds.includes(String(trip.group_id))))
        && !(Array.isArray(trip.hidden_for) && trip.hidden_for.includes(user.id))
      ))
      : previousAppData.trips;

    return normalizeAppData({
      ...previousAppData,
      groups:
        effectiveGroups,
      profile: {
        ...previousAppData.profile,
        id: hydratedProfile.id || previousAppData.profile?.id || "",
        name: hydratedProfile.name || previousAppData.profile?.name || "",
        username: hydratedProfile.username || previousAppData.profile?.username || "",
        email: hydratedProfile.email || previousAppData.profile?.email || "",
        bio: hydratedProfile.bio || previousAppData.profile?.bio || "",
        location: hydratedProfile.location || previousAppData.profile?.location || "",
        availability: hydratedProfile.availability || previousAppData.profile?.availability,
      },
      avatar: profileRow?.avatar_url || previousAppData.avatar || null,
      hangouts: sharedHangouts,
      trips: sharedTrips,
      notifications: !notificationRowsError && Array.isArray(notificationRows)
        ? notificationRows
        : previousAppData.notifications,
    });
  }

  useEffect(() => {
    latestAppDataRef.current = appData;
  }, [appData]);

  useEffect(() => {
    let timeoutId = null;
    const handleToast = (event) => {
      const nextToast = event?.detail?.message ? event.detail : null;
      if (!nextToast) return;
      setToast({
        id: Date.now(),
        message: nextToast.message,
        tone: nextToast.tone || "success",
      });
      if (timeoutId) window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setToast(null);
      }, Number(nextToast.duration) || 1100);
    };

    window.addEventListener("outsiders:toast", handleToast);
    return () => {
      window.removeEventListener("outsiders:toast", handleToast);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const handleHashChange = () => setRoute(getRouteFromLocation());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;

    let isActive = true;

    async function applyValidatedSession(session) {
      if (!session?.access_token) {
        if (!isActive) return;
        setCurrentSession(null);
        setSessionReady(true);
        return;
      }

      const { data: userData, error: userError } = await supabase.auth.getUser(session.access_token);
      if (!isActive) return;

      if ((userError || !userData?.user?.id) && !session?.user?.id) {
        console.warn("[Outsiders] Clearing invalid cached session.");
        clearSupabaseAuthStorage();
        setCurrentSession(null);
        setSessionReady(true);
        return;
      }

      setCurrentSession({ ...session, user: userData?.user || session.user });
      setSessionReady(true);
    }

    async function loadSession() {
      const { data, error } = await supabase.auth.getSession();
      const session = data?.session || null;

      if (error) {
        console.warn("[Outsiders] Could not load auth session:", error.message);
      }

      await applyValidatedSession(session);
    }

    loadSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await applyValidatedSession(session || null);
    });

    return () => {
      isActive = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !sessionReady || !currentSession?.user?.id) return undefined;

    let active = true;

    async function loadProfileFromAccount() {
      const user = currentSession.user;
      const nextAppData = await fetchSharedAppData(user, latestAppDataRef.current);

      if (!active) return;

      setAppData(nextAppData);
    }

    loadProfileFromAccount();
    return () => {
      active = false;
    };
  }, [currentSession, sessionReady]);

  useEffect(() => {
    if (!isSupabaseConfigured || !sessionReady || !currentSession?.user?.id) return undefined;

    let active = true;
    let refreshTimeoutId = null;

    async function refreshSharedData() {
      const nextAppData = await fetchSharedAppData(currentSession.user, latestAppDataRef.current);
      if (!active) return;
      setAppData((prev) => ({
        ...prev,
        groups: nextAppData.groups,
        hangouts: nextAppData.hangouts,
        trips: nextAppData.trips,
        notifications: nextAppData.notifications,
      }));
    }

    const triggerRefresh = () => {
      if (refreshTimeoutId) window.clearTimeout(refreshTimeoutId);
      refreshTimeoutId = window.setTimeout(refreshSharedData, 500);
    };

    const triggerRefreshWhenVisible = () => {
      if (document.visibilityState === "visible") triggerRefresh();
    };

    const intervalId = window.setInterval(refreshSharedData, 20000);
    window.addEventListener("focus", triggerRefresh);
    window.addEventListener("visibilitychange", triggerRefreshWhenVisible);
    window.addEventListener(SHARED_DATA_REFRESH_EVENT, triggerRefresh);

    const realtimeChannel = supabase
      .channel("app-realtime-shared")
      .on("postgres_changes", { event: "*", schema: "public", table: "groups" }, triggerRefresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "trips" }, triggerRefresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, triggerRefresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, triggerRefresh)
      .subscribe();

    return () => {
      active = false;
      window.clearInterval(intervalId);
      if (refreshTimeoutId) window.clearTimeout(refreshTimeoutId);
      window.removeEventListener("focus", triggerRefresh);
      window.removeEventListener("visibilitychange", triggerRefreshWhenVisible);
      window.removeEventListener(SHARED_DATA_REFRESH_EVENT, triggerRefresh);
      supabase.removeChannel(realtimeChannel);
    };
  }, [currentSession, sessionReady]);

  // ─── Supabase Realtime: instant notification delivery ───────────────────────
  useEffect(() => {
    if (!isSupabaseConfigured || !sessionReady || !currentSession?.user?.id) return undefined;

    const userId = currentSession.user.id;

    const channel = supabase
      .channel(`notifications:user:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new;
          if (!row?.id) return;
          setAppData((prev) => {
            // Skip if already present (e.g. added by the creator's optimistic update)
            if ((prev.notifications || []).some((n) => String(n.id) === String(row.id))) {
              return prev;
            }
            const notification = {
              id: String(row.id),
              message: row.message || "",
              groupId: row.group_id || null,
              groupName: row.group_name || "",
              proposalId: row.proposal_id || null,
              proposalCode: row.proposal_code || "",
              link: row.link || "",
              recipient: row.recipient || "",
              recipientKey: row.recipient_key || "",
              userId: row.user_id || null,
              actionScreen: row.action_screen || "",
              actionParams: row.action_params && typeof row.action_params === "object" ? row.action_params : {},
              type: row.type || "general",
              createdAt: row.created_at || new Date().toISOString(),
              read: Boolean(row.read),
            };
            return {
              ...prev,
              notifications: [notification, ...(prev.notifications || [])],
            };
          });
          if (
            String(row.type || "").startsWith("crew-")
            || String(row.type || "").startsWith("hangout-")
          ) {
            window.dispatchEvent(new Event(SHARED_DATA_REFRESH_EVENT));
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new;
          if (!row?.id) return;
          setAppData((prev) => ({
            ...prev,
            notifications: (prev.notifications || []).map((n) =>
              String(n.id) === String(row.id) ? { ...n, read: Boolean(row.read) } : n
            ),
          }));
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.warn("[Outsiders] Realtime notification channel error — falling back to polling.");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentSession?.user?.id, sessionReady]);

  // ─── Supabase Realtime: group updates (new members, hangout proposals, votes) ──
  useEffect(() => {
    if (!isSupabaseConfigured || !sessionReady || !currentSession?.user?.id) return undefined;

    const userId = currentSession.user.id;

    const channel = supabase
      .channel(`groups:changes:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "groups",
        },
        (payload) => {
          const updatedGroup = payload.new;
          if (!updatedGroup?.id) return;

          setAppData((prev) => {
            const existingGroups = prev.groups || [];
            const groupIdx = existingGroups.findIndex(
              (g) => String(g.id) === String(updatedGroup.id)
            );

            // Build the merged group whether or not we already tracked it locally.
            // This ensures new members show up immediately for all crew members.
            const existingGroup = groupIdx !== -1 ? existingGroups[groupIdx] : null;
            const mergedGroup = {
              ...(existingGroup || {}),
              id: updatedGroup.id,
              name: updatedGroup.name ?? existingGroup?.name ?? "",
              emoji: updatedGroup.emoji ?? existingGroup?.emoji ?? "👥",
              code: updatedGroup.code ?? existingGroup?.code ?? "",
              owner_id: updatedGroup.owner_id ?? existingGroup?.owner_id ?? null,
              ownerId: updatedGroup.owner_id ?? existingGroup?.ownerId ?? null,
              owner_username: updatedGroup.owner_username ?? existingGroup?.owner_username ?? "",
              ownerUsername: updatedGroup.owner_username ?? existingGroup?.ownerUsername ?? "",
              members: updatedGroup.members ?? existingGroup?.members ?? [],
              expenses: updatedGroup.expenses ?? existingGroup?.expenses ?? [],
              pending: updatedGroup.pending ?? existingGroup?.pending ?? [],
              cases: updatedGroup.cases ?? existingGroup?.cases ?? [],
              hangoutProposals:
                updatedGroup.hangout_proposals ??
                updatedGroup.hangoutProposals ??
                existingGroup?.hangoutProposals ??
                [],
              billWatch:
                updatedGroup.bill_watch ??
                updatedGroup.billWatch ??
                existingGroup?.billWatch ??
                {},
              peaceMaker:
                updatedGroup.peace_maker ??
                updatedGroup.peaceMaker ??
                existingGroup?.peaceMaker ??
                {},
            };

            // Only include this group if the current user is a member of it.
            const isUserMember = isProfileMemberOfGroup(mergedGroup, {
              ...(prev.profile || {}),
              id: prev.profile?.id || userId,
            });

            if (!isUserMember) return prev;

            const nextGroups = groupIdx !== -1
              ? existingGroups.map((g, i) => i === groupIdx ? mergedGroup : g)
              : [...existingGroups, mergedGroup];

            // Merge updated hangout proposals into the flat hangouts list
            const updatedProposals = (mergedGroup.hangoutProposals || []).map((p) => ({
              ...p,
              groupId: p.groupId || updatedGroup.id,
              groupName: p.groupName || updatedGroup.name,
            }));
            const mergedHangouts = Array.from(
              new Map(
                [...(prev.hangouts || []), ...updatedProposals]
                  .filter((p) => p?.id)
                  .map((p) => [String(p.id), p])
              ).values()
            );

            return {
              ...prev,
              groups: nextGroups,
              hangouts: mergedHangouts,
            };
          });
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.warn("[Outsiders] Realtime groups channel error — falling back to polling.");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentSession?.user?.id, sessionReady]);

  useEffect(() => {
    if (!currentSession?.user?.id) return;

    queueMicrotask(() => {
      setAppData((prev) => {
        if (prev.profile?.id === currentSession.user.id) return prev;
        return {
          ...prev,
          profile: {
            ...prev.profile,
            id: currentSession.user.id,
          },
        };
      });
    });
  }, [currentSession?.user?.id]);

  useEffect(() => {
    window.localStorage.setItem(APP_DATA_STORAGE_KEY, JSON.stringify(appData));
    persistStoredProfile(appData.profile, appData.avatar);
  }, [appData]);

  useEffect(() => {
    if (!PUBLIC_SCREENS.has(route.screen)) {
      window.localStorage.setItem(LAST_APP_ROUTE_STORAGE_KEY, JSON.stringify(route));
    }
  }, [route]);

  // Auth guard: if session check is done and user is on a private screen without a session, send them to landing
  useEffect(() => {
    if (!sessionReady) return;
    if (PUBLIC_SCREENS.has(route.screen)) return;

    const isAuthenticated = isSupabaseConfigured
      ? !!currentSession
      : !!(appData.profile?.name?.trim() || appData.profile?.username?.trim());

    if (!isAuthenticated) {
      window.localStorage.removeItem(LAST_APP_ROUTE_STORAGE_KEY);
      if (window.location.hash) {
        window.location.hash = "";
      } else {
        queueMicrotask(() => setRoute({ screen: DEFAULT_SCREEN, params: {} }));
      }
    }
  }, [sessionReady, currentSession, route.screen, appData.profile?.name, appData.profile?.username]);

  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    window.localStorage.removeItem(LAST_APP_ROUTE_STORAGE_KEY);
    if (window.location.hash) {
      window.location.hash = "";
      return;
    }
    setRoute({ screen: DEFAULT_SCREEN, params: {} });
  };

  const navigate = (nextScreen, params = {}) => {
    const normalized = normalizeScreen(nextScreen);
    if (normalized === "landing" && !PUBLIC_SCREENS.has(route.screen)) {
      logout();
      return;
    }
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
    ).toString();
    const nextHash = normalized === DEFAULT_SCREEN
      ? ""
      : `#/${normalized}${query ? `?${query}` : ""}`;
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
      return;
    }
    setRoute({ screen: normalized, params });
  };

  const isAuthenticated = isSupabaseConfigured
    ? !!currentSession?.user?.id
    : !!(appData.profile?.name?.trim() || appData.profile?.username?.trim());
  const isProtectedScreen = !PUBLIC_SCREENS.has(route.screen);
  const Screen = SCREEN_COMPONENTS[route.screen];
  const availabilityRequired = isProtectedScreen
    && !AVAILABILITY_FRIENDLY_SCREENS.has(route.screen)
    && profileNeedsAvailability(appData.profile);

  return (
    <ErrorBoundary>
      <>
        <OutsidersConfettiBackground />
        <Outsiders3DBackground />
        <style>{`
        .availability-gate {
          position: fixed;
          inset: 0;
          background: rgba(23, 21, 31, 0.52);
          z-index: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fadeIn 220ms ease;
        }
        .availability-gate-card {
          width: min(540px, 100%);
          background: #fff9df;
          border: 4px solid #1a1a2e;
          border-radius: 24px;
          box-shadow: 8px 8px 0 #1a1a2e;
          padding: 28px;
          color: #1a1a2e;
          animation: liftIn 320ms cubic-bezier(0.22, 1, 0.36, 1);
          position: relative;
          overflow: hidden;
        }
        .availability-gate-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: transparent;
          pointer-events: none;
        }
        .availability-gate-btn {
          width: 100%;
          border: 3px solid #1a1a2e;
          border-radius: 12px;
          background: #d98b7f;
          color: #fff;
          font: 400 18px 'Bangers', cursive;
          letter-spacing: 0.06em;
          padding: 14px 18px;
          cursor: pointer;
          box-shadow: 4px 4px 0 #1a1a2e;
          transition: transform 160ms ease, box-shadow 160ms ease;
          position: relative;
          z-index: 1;
        }
        .availability-gate-btn:hover {
          transform: translate(-1px, -2px);
          box-shadow: 5px 5px 0 #1a1a2e;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes liftIn {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .outsiders-toast {
          position: fixed;
          bottom: 28px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 9999;
          background: #1a1a2e;
          color: #fff;
          border: 3px solid #fff;
          border-radius: 14px;
          padding: 12px 24px;
          font-family: 'Nunito', sans-serif;
          font-weight: 800;
          font-size: 15px;
          box-shadow: 5px 5px 0 rgba(0,0,0,0.18);
          animation: toastIn 240ms cubic-bezier(0.22, 1, 0.36, 1);
          white-space: nowrap;
          max-width: calc(100vw - 48px);
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .outsiders-toast.warn { background: #ff9a3c; color: #1a1a2e; border-color: #1a1a2e; }
        .outsiders-toast.error { background: #d98b7f; color: #fff; border-color: #1a1a2e; }
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(12px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        `}</style>

        {availabilityRequired && (
          <div className="availability-gate">
            <div className="availability-gate-card">
              <div style={{ fontFamily: "'Bangers', cursive", fontSize: 13, letterSpacing: "0.12em", color: "#888", marginBottom: 10 }}>HOLD UP</div>
              <h2 style={{ margin: "0 0 10px", fontFamily: "'Bangers', cursive", fontSize: 32, letterSpacing: "0.04em" }}>Set your availability first</h2>
              <p style={{ margin: "0 0 20px", fontWeight: 700, color: "#555", lineHeight: 1.6 }}>
                Your crew needs to know when you are free before you can start planning together. Head to your profile and fill in your weekly availability.
              </p>
              <button className="availability-gate-btn" onClick={() => navigate("profile")}>
                Go to profile →
              </button>
            </div>
          </div>
        )}

        {sessionReady && (!isProtectedScreen || isAuthenticated) && (
          <Screen
            onNavigate={navigate}
            appData={appData}
            setAppData={setAppData}
            routeParams={route.params}
            onLogout={logout}
          />
        )}

        {toast && (
          <div key={toast.id} className={`outsiders-toast${toast.tone !== "success" ? ` ${toast.tone}` : ""}`}>
            {toast.message}
          </div>
        )}

        <style>{`
        :where(*, *::before, *::after) {
          border-color: var(--out-neon-border) !important;
        }

        :where(.root, .out-root, .signup-root) {
          box-shadow: inset 0 0 0 4px var(--out-neon-border);
        }

        [style*="border"] {
          border-color: var(--out-neon-border) !important;
        }

        [style*="border"][style*="box-shadow"] {
          box-shadow: 4px 4px 0 var(--out-neon-border) !important;
        }

        :where(.card, .group-card, .trip-card, .case-card, .review-card, .category-card, .hangout-card, .stat-card, .quick-btn, .modal, .signup-card, .availability-gate-card, .outsiders-toast) {
          border-color: var(--out-neon-border) !important;
        }
        `}</style>
      </>
    </ErrorBoundary>
  );
}
