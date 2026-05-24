import { useEffect, useState } from "react";

const STORAGE_KEY = "outsiders-side-nav-collapsed";

const NAV_ITEMS = [
  { icon: "🏠", label: "Dashboard", target: "dashboard" },
  { icon: "🗓", label: "Hangouts", target: "create-hangout" },
  { icon: "👥", label: "My Crew", target: "friend-groups" },
  { icon: "✈️", label: "Trips", target: "trip-planning" },
  { icon: "💸", label: "Bill Split", target: "bill-split" },
  { icon: "⭐", label: "Ratings", target: "rate-outing" },
  { icon: "❤️", label: "Debrief", target: "debrief" },
  { icon: "🙋", label: "Profile", target: "profile" },
];

function readCollapsed() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_KEY) === "true";
}

export default function OutsidersSideNav({ activeLabel, onNavigate, onLogout, profileName = "You", children }) {
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    const close = () => setMobileOpen(false);
    window.addEventListener("hashchange", close);
    return () => window.removeEventListener("hashchange", close);
  }, []);

  const navWidth = collapsed ? 96 : 248;

  return (
    <>
      <style>{`
        .os-shell {
          min-height: 100vh;
          position: relative;
          z-index: 1;
        }
        .os-mobile-bar {
          display: none;
        }
        .os-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          background: #fffdf9;
          border-right: 4px solid #1a1a2e;
          padding: 18px 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          overflow-y: auto;
          z-index: 70;
          transition: width 180ms ease, transform 180ms ease;
        }
        .os-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 6px 6px 14px;
          border-bottom: 3px solid #1a1a2e;
        }
        .os-logo {
          width: 40px;
          height: 40px;
          background: #ff6b6b;
          border: 3px solid #1a1a2e;
          border-radius: 12px;
          display: grid;
          place-items: center;
          box-shadow: 3px 3px 0 #1a1a2e;
          flex-shrink: 0;
        }
        .os-brand-title {
          font: 400 24px 'Bangers', cursive;
          letter-spacing: 0.04em;
          color: #1a1a2e;
        }
        .os-collapse-btn, .os-mobile-btn, .os-nav-item, .os-logout-btn {
          border: 3px solid #1a1a2e;
          cursor: pointer;
          background: #fff;
          color: #1a1a2e;
          box-shadow: 3px 3px 0 #1a1a2e;
          transition: transform 140ms ease, box-shadow 140ms ease, background 140ms ease;
        }
        .os-collapse-btn, .os-mobile-btn {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          font: 400 18px 'Bangers', cursive;
          flex-shrink: 0;
        }
        .os-nav-group {
          display: grid;
          gap: 8px;
          padding-top: 6px;
        }
        .os-nav-item {
          width: 100%;
          border-radius: 14px;
          padding: 12px 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          font: 800 14px 'Nunito', sans-serif;
          text-align: left;
        }
        .os-nav-item.active {
          background: #fff1c7;
        }
        .os-nav-item:hover, .os-logout-btn:hover, .os-mobile-btn:hover, .os-collapse-btn:hover {
          transform: translate(-1px, -2px);
          box-shadow: 4px 4px 0 #1a1a2e;
        }
        .os-nav-icon {
          width: 22px;
          display: inline-flex;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }
        .os-spacer {
          flex: 1;
        }
        .os-profile {
          border: 3px solid #1a1a2e;
          border-radius: 16px;
          background: #eef8ff;
          box-shadow: 3px 3px 0 #1a1a2e;
          padding: 12px;
          display: grid;
          gap: 6px;
        }
        .os-avatar {
          width: 36px;
          height: 36px;
          border-radius: 999px;
          background: #ff6b6b;
          border: 2px solid #1a1a2e;
          color: #fff;
          display: grid;
          place-items: center;
          font: 900 11px 'Nunito', sans-serif;
        }
        .os-logout-btn {
          border-radius: 12px;
          padding: 11px 14px;
          font: 400 14px 'Bangers', cursive;
          letter-spacing: 0.06em;
        }
        .os-content {
          min-height: 100vh;
          transition: margin-left 180ms ease;
        }
        .os-overlay {
          display: none;
        }
        @media (max-width: 900px) {
          .os-mobile-bar {
            position: sticky;
            top: 0;
            z-index: 80;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 12px;
            background: #fffdf9;
            border-bottom: 4px solid #1a1a2e;
            box-shadow: 0 4px 0 #1a1a2e;
          }
          .os-sidebar {
            width: min(280px, calc(100vw - 56px)) !important;
            transform: translateX(-105%);
            box-shadow: 8px 0 0 #1a1a2e;
          }
          .os-sidebar.mobile-open {
            transform: translateX(0);
          }
          .os-content {
            margin-left: 0 !important;
          }
          .os-overlay {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.32);
            z-index: 60;
          }
        }
      `}</style>

      <div className="os-shell">
        <div className="os-mobile-bar">
          <button type="button" className="os-mobile-btn" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
            ☰
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="os-logo">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" fill="white"/></svg>
            </div>
            <div className="os-brand-title" style={{ fontSize: 22 }}>Outsiders</div>
          </div>
          <button type="button" className="os-mobile-btn" onClick={() => onNavigate?.("profile")} aria-label="Open profile">
            🙋
          </button>
        </div>

        {mobileOpen ? <div className="os-overlay" onClick={() => setMobileOpen(false)} /> : null}

        <aside className={`os-sidebar ${mobileOpen ? "mobile-open" : ""}`} style={{ width: navWidth }}>
          <div className="os-brand">
            <button type="button" onClick={() => onNavigate?.("dashboard")} style={{ all: "unset", cursor: "pointer", display: "contents" }}>
              <div className="os-logo">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" fill="white"/></svg>
              </div>
            </button>
            {!collapsed ? (
              <div style={{ minWidth: 0 }}>
                <div className="os-brand-title">Outsiders</div>
                <div style={{ fontSize: 12, color: "#667085", fontWeight: 800 }}>All-access crew nav</div>
              </div>
            ) : null}
            <div className="os-spacer" />
            <button type="button" className="os-collapse-btn" onClick={() => setCollapsed((current) => !current)} aria-label="Toggle navigation width">
              {collapsed ? "»" : "«"}
            </button>
          </div>

          <div className="os-nav-group">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                type="button"
                className={`os-nav-item ${activeLabel === item.label ? "active" : ""}`}
                onClick={() => {
                  setMobileOpen(false);
                  onNavigate?.(item.target);
                }}
                aria-label={item.label}
                title={collapsed ? item.label : undefined}
              >
                <span className="os-nav-icon">{item.icon}</span>
                {!collapsed ? <span>{item.label}</span> : null}
              </button>
            ))}
          </div>

          <div className="os-spacer" />

          <div className="os-profile">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="os-avatar">{String(profileName || "You").slice(0, 2).toUpperCase()}</div>
              {!collapsed ? (
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 900, color: "#1a1a2e" }}>{profileName || "You"}</div>
                  <div style={{ fontSize: 12, color: "#667085", fontWeight: 800 }}>Signed in</div>
                </div>
              ) : null}
            </div>
            <button
              type="button"
              className="os-logout-btn"
              onClick={() => {
                setMobileOpen(false);
                if (onLogout) onLogout();
                else onNavigate?.("landing");
              }}
            >
              {collapsed ? "↩" : "Log Out"}
            </button>
          </div>
        </aside>

        <div className="os-content" style={{ marginLeft: navWidth }}>
          {children}
        </div>
      </div>
    </>
  );
}
