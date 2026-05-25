import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_PROFILE,
  isProfileMemberOfGroup,
  normalizeAppData,
  persistStoredProfile,
  profileNeedsAvailability,
} from "./appState";
import OutsidersAssistant from "./OutsidersAssistant";
import OutsidersBillSplit from "./OutsidersBillSplit";
import OutsidersCreateHangout from "./OutsidersCreateHangout";
import OutsidersCreateCrew from "./OutsidersCreateCrew";
import OutsidersDashboard from "./OutsidersDashboard";
import OutsidersDebrief from "./OutsidersDebrief";
import OutsidersFriendGroups from "./OutsidersFriendGroups";
import OutsidersHangouts from "./OutsidersHangouts";
import OutsidersJoinHangout from "./Outsidersjoinhangout";
import OutsidersLanding from "./OutsidersLanding";
import OutsidersLogIn from "./OutsidersLogIn";
import OutsidersProfile from "./OutsidersProfile";
import OutsidersRateOuting from "./OutsidersRateOuting";
import OutsidersSignUp from "./Outsiderssignup";
import OutsidersTripPlanning from "./OutsidersTripPlanning";
import OutsidersVoting from "./OutsidersVoting";
import { isSupabaseConfigured, supabase } from "./supabase";

const DEFAULT_SCREEN = "landing";
const APP_DATA_STORAGE_KEY = "outsiders-app-data";
const LAST_APP_ROUTE_STORAGE_KEY = "outsiders-last-app-route";
const PUBLIC_SCREENS = new Set(["landing", "login", "signup"]);
const AVAILABILITY_FRIENDLY_SCREENS = new Set(["profile"]);

const SCREEN_COMPONENTS = {
  "landing": OutsidersLanding,
  "login": OutsidersLogIn,
  "signup": OutsidersSignUp,
  "dashboard": OutsidersDashboard,
  "hangouts": OutsidersHangouts,
  "create-hangout": OutsidersCreateHangout,
  "create-crew": OutsidersCreateCrew,
  "join-hangout": OutsidersJoinHangout,
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

export default function App() {
  const [route, setRoute] = useState(getRouteFromLocation);
  const [appData, setAppData] = useState(getInitialAppData);
  const [toast, setToast] = useState(null);
  const [sessionReady, setSessionReady] = useState(!isSupabaseConfigured);
  const [currentSession, setCurrentSession] = useState(null);
  const groupsHydratedRef = useRef(false);
  const lastSyncedGroupsRef = useRef("");
  const latestAppDataRef = useRef(appData);

async function fetchSharedAppData(user, previousAppData = {}) {
    const metadataGroups = Array.isArray(user.user_metadata?.joined_groups) ? user.user_metadata.joined_groups : null;
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

    const { data: groupRows, error: groupRowsError } = await supabase
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

    const metadataGroupIds = Array.isArray(metadataGroups)
      ? metadataGroups.map((group) => String(group?.id || "")).filter(Boolean)
      : [];
    const metadataGroupCodes = Array.isArray(metadataGroups)
      ? metadataGroups.map((group) => String(group?.code || "").toUpperCase()).filter(Boolean)
      : [];
    const sharedGroups = !groupRowsError && Array.isArray(groupRows)
      ? groupRows.filter((group) => (
        isProfileMemberOfGroup(group, hydratedProfile)
        || metadataGroupIds.includes(String(group?.id || ""))
        || (group?.code && metadataGroupCodes.includes(String(group.code).toUpperCase()))
      ))
      : null;
    const effectiveGroups = Array.isArray(sharedGroups) && sharedGroups.length
      ? sharedGroups
      : (metadataGroups && metadataGroups.length ? metadataGroups : previousAppData.groups);
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

    async function loadSession() {
      const { data } = await supabase.auth.getSession();
      if (!isActive) return;
      setCurrentSession(data.session || null);
      setSessionReady(true);
    }

    loadSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentSession(session || null);
      setSessionReady(true);
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
      groupsHydratedRef.current = true;
      lastSyncedGroupsRef.current = JSON.stringify(nextAppData.groups || []);
    }

    loadProfileFromAccount();
    return () => {
      active = false;
    };
  }, [currentSession, sessionReady]);

  useEffect(() => {
    if (!isSupabaseConfigured || !sessionReady || !currentSession?.user?.id) return undefined;

    let active = true;

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

    const intervalId = window.setInterval(refreshSharedData, 20000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [currentSession, sessionReady]);

  useEffect(() => {
    if (!isSupabaseConfigured || !sessionReady || !currentSession?.user || !groupsHydratedRef.current) return;

    const nextSerializedGroups = JSON.stringify(appData.groups || []);
    if (lastSyncedGroupsRef.current === nextSerializedGroups) return;

    let cancelled = false;

    async function persistJoinedGroups() {
      const currentMetadata = currentSession.user.user_metadata || {};
      const { error } = await supabase.auth.updateUser({
        data: {
          ...currentMetadata,
          joined_groups: appData.groups || [],
        },
      });

      if (!cancelled && !error) {
        lastSyncedGroupsRef.current = nextSerializedGroups;
      }
    }

    persistJoinedGroups();
    return () => {
      cancelled = true;
    };
  }, [appData.groups, currentSession, sessionReady]);

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

  const Screen = SCREEN_COMPONENTS[route.screen];
  const availabilityRequired = !PUBLIC_SCREENS.has(route.screen)
    && !AVAILABILITY_FRIENDLY_SCREENS.has(route.screen)
    && profileNeedsAvailability(appData.profile);

  return (
    <>
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
          background: #ff6b6b;
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
          left: 50%;
          bottom: 24px;
          transform: translateX(-50%);
          z-index: 900;
          min-width: min(320px, calc(100vw - 32px));
          max-width: 520px;
          padding: 12px 18px;
          border-radius: 18px;
          border: 3px solid #1a1a2e;
          box-shadow: 6px 6px 0 #1a1a2e;
          background: #fff7de;
          color: #1a1a2e;
          font: 900 14px 'Nunito', sans-serif;
          letter-spacing: 0.01em;
          animation: toastPop 180ms ease;
        }
        .outsiders-toast.success {
          background: #fff0b8;
        }
        .outsiders-toast.error {
          background: #ffd8d8;
        }
        @keyframes toastPop {
          from { opacity: 0; transform: translateX(-50%) translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
      `}</style>
      <Screen onNavigate={navigate} onLogout={logout} appData={appData} setAppData={setAppData} routeParams={route.params} />
      <OutsidersAssistant route={route} appData={appData} />
      {toast ? (
        <div className={`outsiders-toast ${toast.tone || "success"}`}>
          {toast.message}
        </div>
      ) : null}
      {availabilityRequired ? (
        <div className="availability-gate">
          <div className="availability-gate-card">
            <div style={{ display: "inline-flex", padding: "6px 12px", borderRadius: 10, background: "#ffd93d", border: "2px solid #1a1a2e", font: "400 15px 'Bangers', cursive", letterSpacing: "0.07em", boxShadow: "3px 3px 0 #1a1a2e", marginBottom: 14, transform: "rotate(-2deg)", position: "relative", zIndex: 1 }}>
              Availability Required
            </div>
            <h2 style={{ margin: "0 0 10px", font: "400 36px 'Bangers', cursive", lineHeight: 1, letterSpacing: "0.04em", position: "relative", zIndex: 1 }}>Set your weekly sheet before planning.</h2>
            <p style={{ margin: "0 0 18px", fontSize: 16, lineHeight: 1.5, color: "#475569" }}>
              Outsiders now requires every member to fill out availability before using crews and hangout planning. Your profile has a polished weekly grid waiting for you.
            </p>
            <button type="button" className="availability-gate-btn" onClick={() => navigate("profile")}>
              Open My Availability
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
