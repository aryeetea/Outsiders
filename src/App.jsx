import { useEffect, useState } from "react";
import { DEFAULT_PROFILE, normalizeAppData, persistStoredProfile, profileNeedsAvailability } from "./appState";
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
    persistStoredProfile(appData.profile, appData.avatar);
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
  const availabilityRequired = !PUBLIC_SCREENS.has(route.screen)
    && !AVAILABILITY_FRIENDLY_SCREENS.has(route.screen)
    && profileNeedsAvailability(appData.profile);

  return (
    <>
      <style>{`
        .availability-gate {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.58);
          backdrop-filter: blur(10px);
          z-index: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fadeIn 220ms ease;
        }
        .availability-gate-card {
          width: min(540px, 100%);
          background: linear-gradient(145deg, #fffaf0 0%, #ffffff 60%, #f4fbff 100%);
          border: 3px solid #1a1a2e;
          border-radius: 28px;
          box-shadow: 0 28px 80px rgba(26, 26, 46, 0.22);
          padding: 28px;
          color: #1a1a2e;
          animation: liftIn 320ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .availability-gate-btn {
          width: 100%;
          border: 3px solid #1a1a2e;
          border-radius: 16px;
          background: linear-gradient(135deg, #ff6b6b, #ff9671);
          color: #fff;
          font: 900 18px 'Nunito', sans-serif;
          padding: 14px 18px;
          cursor: pointer;
          box-shadow: 0 14px 30px rgba(255, 107, 107, 0.28);
          transition: transform 160ms ease, box-shadow 160ms ease;
        }
        .availability-gate-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 36px rgba(255, 107, 107, 0.34);
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
      {availabilityRequired ? (
        <div className="availability-gate">
          <div className="availability-gate-card">
            <div style={{ display: "inline-flex", padding: "6px 12px", borderRadius: 999, background: "#fff0c2", border: "2px solid #1a1a2e", fontWeight: 900, marginBottom: 14 }}>
              Availability Required
            </div>
            <h2 style={{ margin: "0 0 10px", fontSize: 32, lineHeight: 1 }}>Set your weekly sheet before planning.</h2>
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
