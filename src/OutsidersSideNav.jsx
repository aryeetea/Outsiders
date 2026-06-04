import { useEffect, useMemo, useState } from "react";
import NotificationCenter from "./NotificationCenter";

const STORAGE_KEY = "outsiders-side-nav-collapsed";

function IconDashboard() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" /></svg>;
}
function IconHangouts() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16" /><path d="M7 4v6" /><path d="M17 4v6" /><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 13h8" /><path d="M8 17h5" /></svg>;
}
function IconCreateHangout() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h10" /><path d="M7 4v6" /><path d="M13 4v6" /><rect x="3" y="5" width="12" height="14" rx="2" /><path d="M19 10v8" /><path d="M15 14h8" /></svg>;
}
function IconCrew() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" /><circle cx="9.5" cy="7" r="3.2" /><path d="M20 21v-2a3.5 3.5 0 0 0-2.5-3.35" /><path d="M15.5 4.1a3.2 3.2 0 0 1 0 5.8" /></svg>;
}
function IconCreateCrew() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" /><circle cx="9.5" cy="7" r="3.2" /><path d="M19 8v6" /><path d="M16 11h6" /></svg>;
}
function IconTrips() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.5 2 12l20-4.5-4.5 4.5z" /><path d="M10 12 6 21l-1.5-.5L6 12" /><path d="M10 12 6 3l-1.5.5L6 12" /></svg>;
}
function IconBillSplit() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18" /><path d="M17 7H9a3 3 0 0 0 0 6h6a3 3 0 0 1 0 6H6" /></svg>;
}
function IconRatings() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9Z" /></svg>;
}
function IconDebrief() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M7 11h10" /><path d="M7 15h6" /><path d="M21 12a8 8 0 0 1-8 8H6l-3 3V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8Z" /></svg>;
}
function IconProfile() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M5 20a7 7 0 0 1 14 0" /></svg>;
}
function IconLogout() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>;
}
function IconCollapse() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M9 5v14" /></svg>;
}
function IconBell() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" /><path d="M9 17a3 3 0 0 0 6 0" /></svg>;
}

const NAV_ITEMS = [
  { icon: <IconDashboard />, label: "Dashboard", target: "dashboard" },
  { icon: <IconProfile />, label: "Profile", target: "profile" },
  { icon: <IconCrew />, label: "My Crew", target: "friend-groups" },
  {
    icon: <IconCreateCrew />,
    label: "Create",
    children: [
      { icon: <IconCreateCrew />, label: "Create Crew", target: "create-crew" },
      { icon: <IconCreateHangout />, label: "Create Hangout", target: "create-hangout" },
    ],
  },
  { icon: <IconHangouts />, label: "Hangouts", target: "hangouts" },
  { icon: <IconTrips />, label: "Trips", target: "trip-planning" },
  { icon: <IconBillSplit />, label: "Bill Split", target: "bill-split" },
  { icon: <IconRatings />, label: "Ratings", target: "rate-outing" },
  { icon: <IconDebrief />, label: "Debrief Court", target: "debrief" },
];

function readCollapsed() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_KEY) === "true";
}

export default function OutsidersSideNav({ activeLabel, onNavigate, onLogout, profileName = "You", notificationCount = 0, appData, setAppData, children }) {
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(() => activeLabel === "Create Crew" || activeLabel === "Create Hangout");
  const notifications = useMemo(
    () => [...(appData?.notifications || [])].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)),
    [appData?.notifications]
  );
  const unreadCount = typeof notificationCount === "number"
    ? notificationCount
    : notifications.filter((item) => !item.read).length;

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    const close = () => setMobileOpen(false);
    window.addEventListener("hashchange", close);
    return () => window.removeEventListener("hashchange", close);
  }, []);

  useEffect(() => {
    const close = () => setNotificationsOpen(false);
    window.addEventListener("hashchange", close);
    return () => window.removeEventListener("hashchange", close);
  }, []);

  useEffect(() => {
    if (activeLabel === "Create Crew" || activeLabel === "Create Hangout") {
      setCreateOpen(true);
    }
  }, [activeLabel]);

  const desktopWidth = collapsed ? 0 : 96;

  return (
    <>
      <style>{`
        .os-shell {
          --os-neon-red: rgba(255, 60, 92, 0.82);
          --os-neon-pink: rgba(255, 43, 164, 0.68);
          --os-neon-coral: rgba(255, 117, 92, 0.52);
          --os-neon-border: rgba(255, 43, 124, 0.9);
          min-height: 100vh;
          position: relative;
          z-index: 1;
        }
        .os-mobile-bar {
          display: none;
        }
        .os-sidebar {
          position: fixed;
          top: 24px;
          left: 18px;
          width: 206px;
          max-height: calc(100vh - 48px);
          background:
            radial-gradient(circle at top, rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.76) 55%, rgba(255, 255, 255, 0.94)),
            #fff8ea;
          border: 3px solid var(--os-neon-border);
          border-radius: 26px;
          box-shadow:
            inset -8px 0 26px rgba(26, 26, 46, 0.05),
            8px 0 28px var(--os-neon-red),
            14px 0 42px var(--os-neon-pink),
            0 0 22px var(--os-neon-coral);
          padding: 14px 10px 16px;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          gap: 12px;
          overflow-x: hidden;
          overflow-y: auto;
          z-index: 70;
          transition: transform 180ms ease, opacity 180ms ease;
          transform: translateX(0);
          opacity: 1;
        }
        .os-sidebar.collapsed {
          transform: translateX(-110%);
          opacity: 0;
          pointer-events: none;
        }
        .os-top {
          display: grid;
          justify-items: stretch;
          gap: 14px;
          width: 100%;
        }
        .os-collapse-btn,
        .os-mobile-btn,
        .os-rail-btn,
        .os-reopen-btn,
        .os-bell-btn {
          border: 0;
          background: transparent;
          color: #1a1a2e;
          cursor: pointer;
          transition: transform 140ms ease, background 140ms ease, opacity 140ms ease;
        }
        .os-collapse-btn:hover,
        .os-mobile-btn:hover,
        .os-rail-btn:hover,
        .os-reopen-btn:hover,
        .os-bell-btn:hover {
          transform: translateY(-1px);
        }
        .os-collapse-btn {
          width: 100%;
          height: 34px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          color: rgba(26, 26, 46, 0.62);
        }
        .os-nav-group {
          width: 100%;
          display: grid;
          justify-items: stretch;
          gap: 8px;
        }
        .os-utility-group {
          width: 100%;
          display: grid;
          justify-items: stretch;
          gap: 8px;
        }
        .os-bell-btn {
          width: 100%;
          min-height: 48px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          gap: 12px;
          justify-content: flex-start;
          padding: 12px 14px;
          color: rgba(26, 26, 46, 0.92);
          background: rgba(255, 217, 61, 0.16);
          position: relative;
        }
        .os-bell-btn.active {
          background: rgba(255, 217, 61, 0.3);
          box-shadow:
            inset 0 0 0 2px rgba(26, 26, 46, 0.08),
            0 8px 18px rgba(26, 26, 46, 0.08);
        }
        .os-bell-panel {
          position: fixed;
          top: 20px;
          left: 244px;
          width: min(380px, calc(100vw - 140px));
          max-height: calc(100vh - 40px);
          overflow-y: auto;
          padding: 18px;
          border-radius: 20px;
          border: 3px solid #17151f;
          background: #fffdf7;
          box-shadow: 10px 10px 0 #17151f;
          z-index: 85;
        }
        .os-rail-btn {
          width: 100%;
          min-height: 48px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          gap: 12px;
          justify-content: flex-start;
          padding: 12px 14px;
          color: rgba(26, 26, 46, 0.92);
        }
        .os-rail-btn.active {
          background: rgba(255, 217, 61, 0.24);
          box-shadow:
            inset 0 0 0 2px rgba(26, 26, 46, 0.08),
            0 8px 18px rgba(26, 26, 46, 0.08);
        }
        .os-create-caret {
          margin-left: auto;
          font: 900 13px 'Nunito', sans-serif;
          transition: transform 150ms ease;
        }
        .os-create-caret.open {
          transform: rotate(90deg);
        }
        .os-subnav {
          display: grid;
          gap: 8px;
          padding: 2px 0 0 16px;
        }
        .os-subnav-btn {
          width: 100%;
          min-height: 44px;
          border: 0;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.6);
          color: rgba(26, 26, 46, 0.88);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 10px;
          padding: 10px 12px;
          transition: transform 140ms ease, background 140ms ease, box-shadow 140ms ease;
        }
        .os-subnav-btn:hover {
          transform: translateY(-1px);
          background: rgba(255, 255, 255, 0.86);
        }
        .os-subnav-btn.active {
          background: rgba(255, 217, 61, 0.26);
          box-shadow: inset 0 0 0 2px rgba(26, 26, 46, 0.08);
        }
        .os-subnav-btn svg {
          width: 18px;
          height: 18px;
        }
        .os-rail-btn span {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .os-label {
          position: static;
          width: auto;
          height: auto;
          padding: 0;
          margin: 0;
          overflow: visible;
          clip: auto;
          white-space: normal;
          border: 0;
          font: 800 13px 'Nunito', sans-serif;
          line-height: 1.2;
          text-align: left;
        }
        .os-spacer {
          display: none;
        }
        .os-bottom {
          display: grid;
          justify-items: stretch;
          gap: 12px;
          width: 100%;
          padding-bottom: 8px;
        }
        .os-avatar-chip {
          width: 44px;
          height: 44px;
          border-radius: 999px;
          background: #ff6b6b;
          color: #fff;
          border: 2px solid #1a1a2e;
          box-shadow: 3px 3px 0 #1a1a2e;
          display: grid;
          place-items: center;
          font: 900 12px 'Nunito', sans-serif;
        }
        .os-notif-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          min-width: 18px;
          height: 18px;
          border-radius: 999px;
          background: #ff6b6b;
          border: 2px solid #fff;
          color: #fff;
          font: 900 10px 'Nunito', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          pointer-events: none;
        }
        .os-bell-wrap {
          position: relative;
          width: 100%;
          display: flex;
          justify-content: stretch;
        }
        .os-bell-wrap .os-notif-badge {
          top: 2px;
          right: 2px;
        }
        .os-rail-btn-wrap {
          position: relative;
          width: 100%;
          display: grid;
          justify-content: stretch;
          gap: 8px;
        }
        .os-rail-btn-wrap .os-notif-badge {
          top: 2px;
          right: 2px;
        }
        @media (max-width: 900px) {
          .os-bell-wrap,
          .os-rail-btn-wrap {
            width: 100%;
          }
        }
        .os-logout-rail {
          color: rgba(26, 26, 46, 0.76);
        }
        .os-content {
          min-height: 100vh;
          transition: margin-left 180ms ease;
        }
        .os-overlay {
          display: none;
        }
        .os-reopen-btn {
          position: fixed;
          top: 24px;
          left: 22px;
          z-index: 75;
          width: 46px;
          height: 34px;
          border-radius: 10px;
          display: grid;
          place-items: center;
          color: rgba(26, 26, 46, 0.62);
          background: rgba(255, 248, 234, 0.96);
          border: 2px solid var(--os-neon-border);
          box-shadow:
            0 6px 18px rgba(26, 26, 46, 0.08),
            0 0 18px var(--os-neon-red),
            0 0 28px var(--os-neon-pink);
        }
        .os-reopen-stack {
          position: fixed;
          top: 24px;
          left: 22px;
          z-index: 75;
          display: grid;
          gap: 10px;
        }
        .os-reopen-stack .os-reopen-btn {
          position: static;
          left: auto;
          top: auto;
        }
        .os-mobile-title {
          font: 400 22px 'Bangers', cursive;
          letter-spacing: 0.04em;
          color: #1a1a2e;
        }
        .os-mobile-btn {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          background: rgba(255, 217, 61, 0.22);
        }
        .os-mobile-drawer-copy,
        .os-mobile-divider,
        .os-mobile-name {
          display: none;
        }
        @media (max-width: 900px) {
          .os-reopen-btn {
            display: none;
          }
          .os-mobile-bar {
            position: sticky;
            top: 0;
            z-index: 80;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 12px 14px;
            background: #fff8ea;
            border-bottom: 3px solid var(--os-neon-border);
            box-shadow:
              0 8px 26px var(--os-neon-red),
              0 12px 36px var(--os-neon-pink);
            backdrop-filter: blur(10px);
          }
          .os-sidebar {
            width: min(280px, calc(100vw - 48px));
            top: 0;
            left: 0;
            bottom: 0;
            max-height: none;
            border-radius: 0 24px 24px 0;
            align-items: stretch;
            padding: 18px 16px;
            transform: translateX(-105%);
            box-shadow:
              10px 0 30px rgba(26, 26, 46, 0.14),
              10px 0 30px var(--os-neon-red),
              16px 0 44px var(--os-neon-pink);
          }
          .os-sidebar.mobile-open {
            transform: translateX(0);
            opacity: 1;
            pointer-events: auto;
          }
          .os-top {
            justify-items: stretch;
            gap: 14px;
          }
          .os-mobile-drawer-copy {
            display: block;
            padding: 6px 4px 12px;
          }
          .os-mobile-drawer-copy .os-mobile-title {
            display: block;
            margin-bottom: 4px;
          }
          .os-mobile-drawer-copy p {
            margin: 0;
            color: #667085;
            font: 800 12px 'Nunito', sans-serif;
          }
          .os-nav-group,
          .os-bottom {
            justify-items: stretch;
          }
          .os-rail-btn {
            width: 100%;
            height: auto;
            min-height: 54px;
            border-radius: 18px;
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 16px;
            justify-content: flex-start;
          }
          .os-bell-btn {
            width: 100%;
            height: auto;
            min-height: 54px;
            border-radius: 18px;
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 16px;
            justify-content: flex-start;
          }
          .os-bell-panel {
            top: 76px;
            left: 12px;
            width: calc(100vw - 24px);
            max-height: calc(100vh - 96px);
          }
          .os-label {
            font: 800 14px 'Nunito', sans-serif;
          }
          .os-bottom {
            gap: 10px;
          }
          .os-avatar-chip {
            display: none;
          }
          .os-mobile-name {
            display: block;
            padding: 0 6px;
            color: #1a1a2e;
            font: 900 13px 'Nunito', sans-serif;
          }
          .os-mobile-divider {
            display: block;
            height: 1px;
            background: rgba(26, 26, 46, 0.08);
            margin: 2px 0 4px;
          }
          .os-content {
            margin-left: 0 !important;
          }
          .os-overlay {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(13, 10, 18, 0.28);
            z-index: 60;
          }
        }
      `}</style>

      <div className="os-shell">
        <div className="os-mobile-bar">
          <button type="button" className="os-mobile-btn" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
            <IconCollapse />
          </button>
          <div className="os-mobile-title">Outsiders</div>
          <button type="button" className="os-mobile-btn" onClick={() => setNotificationsOpen((open) => !open)} aria-label="Open notifications">
            <span style={{ position: "relative", display: "inline-flex" }}>
              <IconBell />
              {unreadCount > 0 ? <span className="os-notif-badge">{unreadCount > 9 ? "9+" : unreadCount}</span> : null}
            </span>
          </button>
        </div>

        {mobileOpen ? <div className="os-overlay" onClick={() => setMobileOpen(false)} /> : null}
        {collapsed ? (
          <div className="os-reopen-stack">
            <button type="button" className="os-reopen-btn" onClick={() => setCollapsed(false)} aria-label="Show sidebar">
              <IconCollapse />
            </button>
            <button
              type="button"
              className="os-reopen-btn"
              onClick={() => setNotificationsOpen((open) => !open)}
              aria-label="Open notifications"
              title="Notifications"
            >
              <span style={{ position: "relative", display: "inline-flex" }}>
                <IconBell />
                {unreadCount > 0 ? <span className="os-notif-badge">{unreadCount > 9 ? "9+" : unreadCount}</span> : null}
              </span>
            </button>
          </div>
        ) : null}

        <aside className={`os-sidebar ${mobileOpen ? "mobile-open" : ""} ${collapsed ? "collapsed" : ""}`}>
          <div className="os-top">
            <button type="button" className="os-collapse-btn" onClick={() => setCollapsed(true)} aria-label="Hide sidebar">
              <IconCollapse />
            </button>
            <div className="os-mobile-drawer-copy">
              <span className="os-mobile-title">Outsiders</span>
              <p>Comic-style crew planning</p>
            </div>
            <div className="os-utility-group">
              <div className="os-bell-wrap">
                <button
                  type="button"
                  className={`os-bell-btn ${notificationsOpen ? "active" : ""}`}
                  onClick={() => setNotificationsOpen((open) => !open)}
                  aria-label="Open notifications"
                  title="Notifications"
                >
                  <span><IconBell /></span>
                  <span className="os-label">Notifications</span>
                </button>
                {unreadCount > 0 ? <span className="os-notif-badge">{unreadCount > 9 ? "9+" : unreadCount}</span> : null}
              </div>
            </div>
            <div className="os-nav-group">
              {NAV_ITEMS.map((item) => (
                <div key={item.label} className="os-rail-btn-wrap">
                  {item.children ? (
                    <>
                      <button
                        type="button"
                        className={`os-rail-btn ${item.children.some((child) => activeLabel === child.label) ? "active" : ""}`}
                        onClick={() => setCreateOpen((open) => !open)}
                        aria-label={item.label}
                        aria-expanded={createOpen}
                        title={item.label}
                        style={{ width: "100%" }}
                      >
                        <span>{item.icon}</span>
                        <span className="os-label">{item.label}</span>
                        <span className={`os-create-caret ${createOpen ? "open" : ""}`}>›</span>
                      </button>
                      {createOpen ? (
                        <div className="os-subnav">
                          {item.children.map((child) => (
                            <button
                              key={child.label}
                              type="button"
                              className={`os-subnav-btn ${activeLabel === child.label ? "active" : ""}`}
                              onClick={() => {
                                setMobileOpen(false);
                                onNavigate?.(child.target);
                              }}
                              aria-label={child.label}
                              title={child.label}
                            >
                              <span>{child.icon}</span>
                              <span className="os-label">{child.label}</span>
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <button
                      type="button"
                      className={`os-rail-btn ${activeLabel === item.label ? "active" : ""}`}
                      onClick={() => {
                        setMobileOpen(false);
                        onNavigate?.(item.target);
                      }}
                      aria-label={item.label}
                      title={item.label}
                      style={{ width: "100%" }}
                    >
                      <span>{item.icon}</span>
                      <span className="os-label">{item.label}</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="os-spacer" />

          <div className="os-bottom">
            <div className="os-mobile-divider" />
            <div className="os-mobile-name">{profileName}</div>
            <button type="button" className="os-avatar-chip" onClick={() => onNavigate?.("profile")} aria-label="Open profile" title={profileName}>
              {String(profileName || "You").slice(0, 2).toUpperCase()}
            </button>
            <button
              type="button"
              className="os-rail-btn os-logout-rail"
              onClick={() => {
                setMobileOpen(false);
                if (onLogout) onLogout();
                else onNavigate?.("landing");
              }}
              aria-label="Log out"
              title="Log out"
            >
              <span><IconLogout /></span>
              <span className="os-label">Log Out</span>
            </button>
          </div>
        </aside>

        {notificationsOpen ? (
          <div className="os-bell-panel">
            <NotificationCenter
              notifications={notifications}
              setAppData={setAppData}
              onNavigate={onNavigate}
              title="Notification center"
              subtitle="Every crew, plan, trip, and debrief update stays connected here."
              compact
              limit={12}
              emptyTitle="No notifications yet."
              emptyCopy="Once your crew starts moving, every important update will land here."
              onAfterOpen={() => {
                setNotificationsOpen(false);
                setMobileOpen(false);
              }}
            />
          </div>
        ) : null}

        <div className="os-content" style={{ marginLeft: desktopWidth }}>
          {children}
        </div>
      </div>
    </>
  );
}
