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

const DEFAULT_SCREEN = "landing";

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
  const next = (screen || "").replace(/^#\/?/, "").trim();
  return SCREEN_COMPONENTS[next] ? next : DEFAULT_SCREEN;
}

function getScreenFromLocation() {
  if (typeof window === "undefined") return DEFAULT_SCREEN;
  return normalizeScreen(window.location.hash);
}

export default function App() {
  const [screen, setScreen] = useState(getScreenFromLocation);

  useEffect(() => {
    const handleHashChange = () => setScreen(getScreenFromLocation());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navigate = (nextScreen) => {
    const normalized = normalizeScreen(nextScreen);
    const nextHash = normalized === DEFAULT_SCREEN ? "" : `#/${normalized}`;
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
      return;
    }
    setScreen(normalized);
  };

  const Screen = SCREEN_COMPONENTS[screen];
  return <Screen onNavigate={navigate} />;
}
