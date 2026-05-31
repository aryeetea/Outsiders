import { Component, useEffect, useRef, useState } from "react";
import {
  DEFAULT_PROFILE,
  isProfileMemberOfGroup,
  normalizeAppData,
  persistStoredProfile,
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

const DEFAULT_SCREEN = "landing";
const APP_DATA_STORAGE_KEY = "outsiders-app-data";
const SHARED_DATA_REFRESH_EVENT = "outsiders:shared-data-refresh";
const PUBLIC_SCREENS = new Set(["landing", "login", "signup"]);

const SCREEN_COMPONENTS = {
  landing: OutsidersLanding,
  login: OutsidersLogIn,
  signup: OutsidersSignUp,
  dashboard: OutsidersDashboard,
  hangouts: OutsidersHangouts,
  "create-hangout": OutsidersCreateHangout,
  "create-crew": OutsidersCreateCrew,
  voting: OutsidersVoting,
  "friend-groups": OutsidersFriendGroups,
  "trip-planning": OutsidersTripPlanning,
  "bill-split": OutsidersBillSplit,
  "rate-outing": OutsidersRateOuting,
  debrief: OutsidersDebrief,
  profile: OutsidersProfile,
};

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
            width: 56,
            height: 56,
            background: "#ff6b6b",
            border: "4px solid #1a1a2e",
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            boxShadow: "4px 4px 0 #1a1a2e",
          }}>
            !
          </div>
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
              marginTop: 8,
              padding: "12px 28px",
              background: "#ff6b6b",
              color: "#fff",
              border: "3px solid #1a1a2e",
              borderRadius: 10,
              fontFamily: "'Bangers', cursive",
              fontSize: 20,
              letterSpacing: "0.06em",
              cursor: "pointer",
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
    return normalizeAppData(saved ? JSON.parse(saved) : {});
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
      console.warn("[Outsiders] Could not repair user profile:", ensuredProfile.error.message);
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

    const { data: rawGroupRows, error: groupRowsError } = await supabase.from("groups").select("*");
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
      groups: effectiveGroups,
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
      avatar: profileRow?.avatar_url || user.user_metadata?.avatar_url || previousAppData.avatar || null,
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
    const handleHashChange = () => setRoute(getRouteFromLocation());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

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
      timeoutId = window.setTimeout(() => setToast(null), Number(nextToast.duration) || 1100);
    };

    window.addEventListener("outsiders:toast", handleToast);
    return () => {
      window.removeEventListener("outsiders:toast", handleToast);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem(APP_DATA_STORAGE_KEY, JSON.stringify(appData));
    persistStoredProfile(appData.profile, appData.avatar);
  }, [appData]);

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
        clearSupabaseAuthStorage();
        setCurrentSession(null);
        setSessionReady(true);
        return;
      }

      setCurrentSession({ ...session, user: userData?.user || session.user });
      setSessionReady(true);
    }

    async function loadSession() {
      const { data } = await supabase.auth.getSession();
      await applyValidatedSession(data?.session || null);
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

    async function loadFromDatabase() {
      const nextAppData = await fetchSharedAppData(currentSession.user, latestAppDataRef.current);
      if (active) setAppData(nextAppData);
    }

    loadFromDatabase();
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

    const intervalId = window.setInterval(refreshSharedData, 20000);
    window.addEventListener("focus", triggerRefresh);
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
      window.removeEventListener(SHARED_DATA_REFRESH_EVENT, triggerRefresh);
      supabase.removeChannel(realtimeChannel);
    };
  }, [currentSession, sessionReady]);

  useEffect(() => {
    if (PUBLIC_SCREENS.has(route.screen)) return;

    const hasProfile = isSupabaseConfigured
      ? Boolean(currentSession?.user?.id)
      : Boolean(appData.profile?.name?.trim() || appData.profile?.username?.trim());
    if (!hasProfile) {
      setRoute({ screen: DEFAULT_SCREEN, params: {} });
      if (window.location.hash) window.location.hash = "";
    }
  }, [appData.profile?.name, appData.profile?.username, currentSession?.user?.id, route.screen]);

  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setAppData(normalizeAppData({ profile: DEFAULT_PROFILE }));
    if (window.location.hash) {
      window.location.hash = "";
      return;
    }
    setRoute({ screen: DEFAULT_SCREEN, params: {} });
  };

  const navigate = (nextScreen, params = {}) => {
    const normalized = normalizeScreen(nextScreen);
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

  const Screen = SCREEN_COMPONENTS[route.screen] || SCREEN_COMPONENTS[DEFAULT_SCREEN];
  const canRenderScreen = PUBLIC_SCREENS.has(route.screen)
    || (isSupabaseConfigured ? Boolean(currentSession?.user?.id) : Boolean(appData.profile?.name?.trim() || appData.profile?.username?.trim()));

  return (
    <ErrorBoundary>
      <>
        {sessionReady && canRenderScreen && (
          <Screen
            onNavigate={navigate}
            appData={appData}
            setAppData={setAppData}
            routeParams={route.params}
            onLogout={logout}
          />
        )}

        {toast && (
          <div
            key={toast.id}
            className={`outsiders-toast${toast.tone !== "success" ? ` ${toast.tone}` : ""}`}
            style={{
              position: "fixed",
              bottom: 28,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 9999,
              background: toast.tone === "warn" ? "#ff9a3c" : toast.tone === "error" ? "#ff6b6b" : "#1a1a2e",
              color: toast.tone === "warn" ? "#1a1a2e" : "#fff",
              border: `3px solid ${toast.tone === "success" ? "#fff" : "#1a1a2e"}`,
              borderRadius: 14,
              padding: "12px 24px",
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 800,
              fontSize: 15,
              boxShadow: "5px 5px 0 rgba(0,0,0,0.18)",
              whiteSpace: "nowrap",
              maxWidth: "calc(100vw - 48px)",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {toast.message}
          </div>
        )}
      </>
    </ErrorBoundary>
  );
}
