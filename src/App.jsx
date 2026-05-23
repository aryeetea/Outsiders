import { useEffect, useState } from "react";
import OutsidersAI from "./OutsidersAI";
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

const DEFAULT_SCREEN = "landing";
const APP_DATA_STORAGE_KEY = "outsiders-app-data";

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

  useEffect(() => {
    const handleHashChange = () => setRoute(getRouteFromLocation());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(APP_DATA_STORAGE_KEY, JSON.stringify(appData));
  }, [appData]);

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

  const Screen = SCREEN_COMPONENTS[route.screen];
  return (
    <>
      <Screen onNavigate={navigate} appData={appData} setAppData={setAppData} routeParams={route.params} />
      <OutsidersAI screen={route.screen} appData={appData} />
    </>
  );
}
