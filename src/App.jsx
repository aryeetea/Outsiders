import { useEffect, useRef, useState } from "react";
import { DEFAULT_PROFILE, normalizeAppData, persistStoredProfile, profileNeedsAvailability } from "./appState";
import OutsidersAssistant from "./OutsidersAssistant";
import OutsidersBillSplit from "./OutsidersBillSplit";
import OutsidersCreateHangout from "./OutsidersCreateHangout";
import OutsidersDashboard from "./OutsidersDashboard";
import OutsidersDebrief from "./OutsidersDebrief";
import OutsidersFriendGroups from "./OutsidersFriendGroups";
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
  "create-hangout": OutsidersCreateHangout,
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
  const [sessionReady, setSessionReady] = useState(!isSupabaseConfigured);
  const [currentSession, setCurrentSession] = useState(null);
  const groupsHydratedRef = useRef(false);
  const lastSyncedGroupsRef = useRef("");

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
      const metadataGroups = Array.isArray(user.user_metadata?.joined_groups) ? user.user_metadata.joined_groups : null;
      const { data: profileRow } = await supabase
        .from("profiles")
        .select("full_name, username, email, availability")
        .eq("id", user.id)
        .maybeSingle();

      if (!active) return;

      setAppData((prev) => normalizeAppData({
        ...prev,
        groups: metadataGroups && metadataGroups.length ? metadataGroups : prev.groups,
        profile: {
          ...prev.profile,
          name: profileRow?.full_name || user.user_metadata?.full_name || prev.profile?.name || "",
          username: profileRow?.username || user.user_metadata?.username || prev.profile?.username || "",
          email: profileRow?.email || user.email || prev.profile?.email || "",
          bio: user.user_metadata?.bio || prev.profile?.bio || "",
          location: user.user_metadata?.location || prev.profile?.location || "",
          availability: profileRow?.availability || user.user_metadata?.availability || prev.profile?.availability,
        },
      }));
      groupsHydratedRef.current = true;
      lastSyncedGroupsRef.current = metadataGroups ? JSON.stringify(metadataGroups) : "";
    }

    loadProfileFromAccount();
    return () => {
      active = false;
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
        setRoute({ screen: DEFAULT_SCREEN, params: {} });
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
      `}</style>
      <Screen onNavigate={navigate} onLogout={logout} appData={appData} setAppData={setAppData} routeParams={route.params} />
      <OutsidersAssistant route={route} appData={appData} />
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
