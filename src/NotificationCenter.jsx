import { useMemo, useState } from "react";
import { isSupabaseConfigured, supabase } from "./supabase";

const FILTERS = ["All", "Unread", "Crew", "Plans", "Bills", "Trips", "Debrief"];

function normalizeType(value = "") {
  return String(value || "").trim().toLowerCase();
}

function getNotificationBucket(notification = {}) {
  const type = normalizeType(notification.type);
  if (type.startsWith("crew-")) return "Crew";
  if (type.startsWith("hangout-")) return "Plans";
  if (type.startsWith("expense-") || type.startsWith("bill-")) return "Bills";
  if (type.startsWith("trip-")) return "Trips";
  if (type.startsWith("debrief-")) return "Debrief";
  return "All";
}

function getNotificationAccent(notification = {}) {
  const bucket = getNotificationBucket(notification);
  if (bucket === "Crew") return { bg: "#fff4dd", border: "#ffb84d", text: "#8a4b00", label: "Crew" };
  if (bucket === "Plans") return { bg: "#e8f7ff", border: "#44bdf0", text: "#0f4c81", label: "Hangout" };
  if (bucket === "Bills") return { bg: "#fff2ea", border: "#ff9a3c", text: "#8c3f0a", label: "Bills" };
  if (bucket === "Trips") return { bg: "#eefdf5", border: "#58c77a", text: "#13653a", label: "Trip" };
  if (bucket === "Debrief") return { bg: "#fff0f4", border: "#ff7aa2", text: "#8f1d47", label: "Debrief" };
  return { bg: "#f4f4f5", border: "#d4d4d8", text: "#3f3f46", label: "Update" };
}

function getNotificationActionLabel(notification = {}) {
  const type = normalizeType(notification.type);
  if (type === "crew-invite") return "Join crew";
  if (type === "hangout-invite") return "Join hangout";
  if (type.startsWith("expense-") || type.startsWith("bill-")) return "Open bills";
  if (type.startsWith("trip-")) return "Open trip";
  if (type.startsWith("debrief-")) return "Open case";
  if (type.startsWith("hangout-")) return "Open hangout";
  if (type.startsWith("crew-")) return "Open crew";
  return "Open update";
}

function formatNotificationTime(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "Just now";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / 60000);
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function NotificationCenter({
  notifications = [],
  setAppData,
  onNavigate,
  title = "Notifications",
  subtitle = "Your connected crew updates live here.",
  compact = false,
  limit = null,
  emptyTitle = "No notifications yet.",
  emptyCopy = "When your crew does something that needs your attention, it will show up here.",
  onAfterOpen,
}) {
  const [activeFilter, setActiveFilter] = useState("All");
  const sortedNotifications = useMemo(
    () => [...(notifications || [])].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)),
    [notifications]
  );
  const unreadCount = sortedNotifications.filter((notification) => !notification.read).length;

  const visibleNotifications = useMemo(() => {
    const filtered = sortedNotifications.filter((notification) => {
      if (activeFilter === "Unread") return !notification.read;
      if (activeFilter === "All") return true;
      return getNotificationBucket(notification) === activeFilter;
    });

    return typeof limit === "number" ? filtered.slice(0, limit) : filtered;
  }, [activeFilter, limit, sortedNotifications]);

  const markNotificationRead = async (notificationId) => {
    if (isSupabaseConfigured) {
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);
    }

    setAppData?.((prev) => ({
      ...prev,
      notifications: (prev.notifications || []).map((item) => (
        String(item.id) === String(notificationId) ? { ...item, read: true } : item
      )),
    }));
  };

  const markAllNotificationsRead = async () => {
    const unreadIds = sortedNotifications.filter((notification) => !notification.read).map((notification) => notification.id);
    if (!unreadIds.length) return;

    if (isSupabaseConfigured) {
      await supabase
        .from("notifications")
        .update({ read: true })
        .in("id", unreadIds);
    }

    setAppData?.((prev) => ({
      ...prev,
      notifications: (prev.notifications || []).map((notification) => ({ ...notification, read: true })),
    }));
  };

  return (
    <>
      <style>{`
        .oc-stack {
          display: grid;
          gap: ${compact ? 12 : 16}px;
        }
        .oc-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 14px;
          flex-wrap: wrap;
        }
        .oc-title {
          margin: 0;
          font: 400 ${compact ? 22 : 28}px 'Bangers', cursive;
          letter-spacing: 0.05em;
          color: #17151f;
        }
        .oc-copy {
          margin: 4px 0 0;
          color: #667085;
          font: 800 ${compact ? 12 : 14}px 'Nunito', sans-serif;
          line-height: 1.5;
          max-width: 54ch;
        }
        .oc-head-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
        }
        .oc-unread-chip,
        .oc-pill,
        .oc-action,
        .oc-mark {
          border-radius: 999px;
          border: 3px solid #17151f;
          box-shadow: 3px 3px 0 #17151f;
        }
        .oc-unread-chip {
          padding: 8px 12px;
          background: #fff4c8;
          color: #17151f;
          font: 900 12px 'Nunito', sans-serif;
        }
        .oc-mark,
        .oc-action {
          background: #fffdf7;
          color: #17151f;
          cursor: pointer;
          transition: transform 140ms ease, box-shadow 140ms ease;
        }
        .oc-mark:hover,
        .oc-action:hover,
        .oc-filter:hover {
          transform: translate(-1px, -2px);
        }
        .oc-mark {
          padding: 8px 12px;
          font: 400 12px 'Bangers', cursive;
          letter-spacing: 0.06em;
        }
        .oc-filters {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .oc-filter {
          border: 3px solid #17151f;
          border-radius: 999px;
          padding: 8px 12px;
          background: #fff6dc;
          color: #5b5568;
          box-shadow: 3px 3px 0 #17151f;
          cursor: pointer;
          font: 800 12px 'Nunito', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          transition: transform 140ms ease, box-shadow 140ms ease, background 140ms ease;
        }
        .oc-filter.active {
          background: #17151f;
          color: #fff7da;
          box-shadow: 4px 4px 0 #ff6b6b;
        }
        .oc-list {
          display: grid;
          gap: 12px;
        }
        .oc-card {
          border-radius: 18px;
          border: 3px solid #17151f;
          background: #fffdf7;
          box-shadow: 5px 5px 0 #17151f;
          padding: ${compact ? 14 : 18}px;
          display: grid;
          gap: 12px;
          position: relative;
          overflow: hidden;
        }
        .oc-card::after {
          content: '';
          position: absolute;
          right: -16px;
          top: -18px;
          width: 74px;
          height: 74px;
          border-radius: 50%;
          background: rgba(255, 217, 61, 0.16);
          pointer-events: none;
        }
        .oc-card.read {
          opacity: 0.74;
        }
        .oc-topline {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
          flex-wrap: wrap;
        }
        .oc-message {
          margin: 0;
          color: #17151f;
          font: 800 ${compact ? 14 : 16}px 'Nunito', sans-serif;
          line-height: 1.55;
          max-width: 60ch;
        }
        .oc-pill {
          display: inline-flex;
          align-items: center;
          padding: 6px 10px;
          background: #eefdf5;
          color: #0f766e;
          font: 900 11px 'Nunito', sans-serif;
          white-space: nowrap;
        }
        .oc-meta {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: center;
        }
        .oc-tag {
          display: inline-flex;
          align-items: center;
          padding: 6px 10px;
          border-radius: 999px;
          border: 2px solid currentColor;
          font: 900 11px 'Nunito', sans-serif;
        }
        .oc-timestamp {
          color: #667085;
          font: 800 12px 'Nunito', sans-serif;
        }
        .oc-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .oc-action {
          padding: 9px 13px;
          font: 400 12px 'Bangers', cursive;
          letter-spacing: 0.06em;
        }
        .oc-action.primary {
          background: #ff6b6b;
          color: #fff;
        }
        .oc-empty {
          border-radius: 18px;
          border: 3px dashed rgba(23, 21, 31, 0.24);
          background: #fff9ec;
          padding: ${compact ? 18 : 24}px;
          text-align: center;
          display: grid;
          gap: 8px;
        }
        .oc-empty strong {
          color: #17151f;
        }
        .oc-empty p {
          margin: 0;
          color: #667085;
          font: 800 13px 'Nunito', sans-serif;
          line-height: 1.55;
        }
        @media (max-width: 720px) {
          .oc-head {
            align-items: stretch;
          }
          .oc-head-actions {
            justify-content: space-between;
          }
          .oc-actions {
            display: grid;
          }
          .oc-action,
          .oc-mark {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>

      <section className="oc-stack">
        <div className="oc-head">
          <div>
            <h3 className="oc-title">{title}</h3>
            <p className="oc-copy">{subtitle}</p>
          </div>
          <div className="oc-head-actions">
            <span className="oc-unread-chip">{unreadCount} unread</span>
            {unreadCount ? (
              <button type="button" className="oc-mark" onClick={markAllNotificationsRead}>
                Mark all read
              </button>
            ) : null}
          </div>
        </div>

        <div className="oc-filters">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              className={`oc-filter ${activeFilter === filter ? "active" : ""}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="oc-list">
          {visibleNotifications.length ? visibleNotifications.map((notification) => {
            const accent = getNotificationAccent(notification);
            return (
              <article key={notification.id} className={`oc-card ${notification.read ? "read" : ""}`}>
                <div className="oc-topline">
                  <p className="oc-message">{notification.message}</p>
                  {!notification.read ? <span className="oc-pill">New</span> : null}
                </div>

                <div className="oc-meta">
                  <span
                    className="oc-tag"
                    style={{ background: accent.bg, borderColor: accent.border, color: accent.text }}
                  >
                    {accent.label}
                  </span>
                  {notification.groupName ? <span className="oc-timestamp">{notification.groupName}</span> : null}
                  <span className="oc-timestamp">{formatNotificationTime(notification.createdAt)}</span>
                </div>

                <div className="oc-actions">
                  {notification.actionScreen ? (
                    <button
                      type="button"
                      className="oc-action primary"
                      onClick={async () => {
                        if (!notification.read) {
                          await markNotificationRead(notification.id);
                        }
                        onAfterOpen?.();
                        onNavigate?.(notification.actionScreen, notification.actionParams || {});
                      }}
                    >
                      {getNotificationActionLabel(notification)}
                    </button>
                  ) : null}
                  {!notification.read ? (
                    <button
                      type="button"
                      className="oc-action"
                      onClick={() => markNotificationRead(notification.id)}
                    >
                      Mark read
                    </button>
                  ) : null}
                </div>
              </article>
            );
          }) : (
            <div className="oc-empty">
              <strong>{emptyTitle}</strong>
              <p>{emptyCopy}</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
