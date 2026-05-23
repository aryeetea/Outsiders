import { useEffect, useState } from "react";
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
  if (typeof window === "undefined") {
    return { groups: [], hangouts: [], trips: [] };
  }

  try {
    const saved = window.localStorage.getItem(APP_DATA_STORAGE_KEY);
    if (!saved) return { groups: [], hangouts: [], trips: [] };
    const parsed = JSON.parse(saved);
    return {
      groups: Array.isArray(parsed?.groups) ? parsed.groups : [],
      hangouts: Array.isArray(parsed?.hangouts) ? parsed.hangouts : [],
      trips: Array.isArray(parsed?.trips) ? parsed.trips : [],
    };
  } catch {
    return { groups: [], hangouts: [], trips: [] };
  }
}

export default function App() {
  const [route, setRoute] = useState(getRouteFromLocation);
  const [appData, setAppData] = useState(getInitialAppData);
  const [sessionReady, setSessionReady] = useState(!isSupabaseConfigured);
  const [currentSession, setCurrentSession] = useState(null);

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
    window.localStorage.setItem(APP_DATA_STORAGE_KEY, JSON.stringify(appData));
  }, [appData]);

  useEffect(() => {
    if (!sessionReady || !currentSession || !PUBLIC_SCREENS.has(route.screen)) return;

    const saved = window.localStorage.getItem(LAST_APP_ROUTE_STORAGE_KEY);
    let nextRoute = { screen: "dashboard", params: {} };

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (SCREEN_COMPONENTS[parsed?.screen] && !PUBLIC_SCREENS.has(parsed.screen)) {
          nextRoute = { screen: parsed.screen, params: parsed.params || {} };
        }
      } catch {
        nextRoute = { screen: "dashboard", params: {} };
      }
    }

    const query = new URLSearchParams(
      Object.entries(nextRoute.params).filter(([, value]) => value !== undefined && value !== null && value !== "")
    ).toString();
    const nextHash = `#/${nextRoute.screen}${query ? `?${query}` : ""}`;
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
    }
  }, [currentSession, route.screen, sessionReady]);

  useEffect(() => {
    if (!PUBLIC_SCREENS.has(route.screen)) {
      window.localStorage.setItem(LAST_APP_ROUTE_STORAGE_KEY, JSON.stringify(route));
    }
  }, [route]);

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
  return (
    <>
      <Screen onNavigate={navigate} onLogout={logout} appData={appData} setAppData={setAppData} routeParams={route.params} />
    </>
  );
}
