import { useEffect, useState } from "react";
import AvailabilitySheet from "./AvailabilitySheet";
import { DEFAULT_PROFILE } from "./appState";
import { availabilityToText, hasAvailability } from "./scheduling";
import { isSupabaseConfigured, supabase } from "./supabase";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Nunito:wght@400;600;700;800;900&display=swap');

  * { box-sizing: border-box; }
  body { margin: 0; background: #f5f3ee; }

  .profile-root {
    min-height: 100vh;
    color: #1a1a2e;
    font-family: 'Nunito', sans-serif;
    background: #f5f3ee;
  }

  .profile-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: radial-gradient(circle, #1a1a2e 1px, transparent 1px);
    background-size: 24px 24px;
    opacity: 0.03;
    pointer-events: none;
    z-index: 0;
  }

  .profile-shell {
    max-width: 1320px;
    margin: 0 auto;
    padding: 28px 20px 56px;
    display: grid;
    gap: 24px;
    position: relative;
    z-index: 1;
  }

  .topbar, .panel, .sheet-panel {
    border: 4px solid #1a1a2e;
    border-radius: 20px;
    background: #fffdf9;
    box-shadow: 6px 6px 0 #1a1a2e;
  }

  .topbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    padding: 18px 22px;
  }

  .brand-btn, .nav-btn, .action-btn, .ghost-btn, .slot-chip {
    transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease, border-color 160ms ease;
  }

  .brand-btn {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    border: none;
    background: none;
    cursor: pointer;
    color: #1d2238;
  }

  .logo-mark {
    width: 42px;
    height: 42px;
    background: #ff6b6b;
    border: 3px solid #1a1a2e;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 3px 3px 0 #1a1a2e;
  }

  .nav-row {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .nav-btn {
    border: 3px solid #1a1a2e;
    background: #fff;
    color: #666;
    padding: 10px 14px;
    border-radius: 10px;
    cursor: pointer;
    font: 800 13px 'Nunito', sans-serif;
    box-shadow: 3px 3px 0 #1a1a2e;
  }

  .nav-btn.active, .nav-btn:hover {
    background: #fff;
    color: #1a1a2e;
    transform: translateY(-1px);
    border-color: #ff6b6b;
    box-shadow: 3px 3px 0 #ff6b6b;
  }

  .hero-grid {
    display: grid;
    grid-template-columns: minmax(280px, 360px) minmax(0, 1fr);
    gap: 24px;
  }

  .panel {
    padding: 24px;
  }

  .profile-card {
    background: #fde8f0;
    border-color: #ff6b9d;
    box-shadow: 6px 6px 0 #ff6b9d;
  }

  .avatar-circle {
    width: 86px;
    height: 86px;
    border-radius: 24px;
    background: #ff6b6b;
    border: 4px solid #1a1a2e;
    color: white;
    display: grid;
    place-items: center;
    font: 900 28px 'Nunito', sans-serif;
    box-shadow: 5px 5px 0 #1a1a2e;
  }

  .eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 2px 10px;
    border-radius: 8px;
    border: 2px solid #1a1a2e;
    background: #ffd93d;
    color: #1a1a2e;
    font: 400 12px 'Bangers', cursive;
    box-shadow: 2px 2px 0 #1a1a2e;
    transform: rotate(-2deg);
  }

  .profile-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
    margin-top: 18px;
  }

  .stat-tile {
    padding: 14px;
    border-radius: 16px;
    background: #fff;
    border: 3px solid #1a1a2e;
    box-shadow: 4px 4px 0 #1a1a2e;
  }

  .stat-label {
    margin: 0 0 6px;
    font-size: 12px;
    font-weight: 700;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .action-btn, .ghost-btn {
    border-radius: 10px;
    cursor: pointer;
    font: 400 15px 'Bangers', cursive;
    letter-spacing: 0.06em;
    padding: 13px 16px;
  }

  .action-btn {
    border: 3px solid #1a1a2e;
    background: #ff6b6b;
    color: white;
    box-shadow: 4px 4px 0 #1a1a2e;
  }

  .ghost-btn {
    border: 3px solid #1a1a2e;
    background: #fff;
    color: #1a1a2e;
    box-shadow: 4px 4px 0 #1a1a2e;
  }

  .action-btn:hover, .ghost-btn:hover, .slot-chip:hover {
    transform: translateY(-2px);
  }

  .details-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .field {
    display: grid;
    gap: 8px;
  }

  .field label {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #7a8294;
  }

  .field input, .field textarea {
    width: 100%;
    border: 3px solid #1a1a2e;
    border-radius: 10px;
    padding: 13px 14px;
    background: #fffdf9;
    color: #1a1a2e;
    font: 700 15px 'Nunito', sans-serif;
    outline: none;
    box-shadow: 3px 3px 0 #1a1a2e;
  }

  .field textarea {
    min-height: 112px;
    resize: vertical;
  }

  .notice-card {
    padding: 16px 18px;
    border-radius: 16px;
    background: #fff4e6;
    border: 3px solid #ff9a3c;
    box-shadow: 4px 4px 0 #ff9a3c;
    color: #7b4e12;
  }

  .notif-list {
    display: grid;
    gap: 12px;
  }

  .notif-item {
    padding: 14px 16px;
    border-radius: 14px;
    background: #fff;
    border: 3px solid #1a1a2e;
    box-shadow: 4px 4px 0 #1a1a2e;
  }

  @media (max-width: 1080px) {
    .hero-grid, .details-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 720px) {
    .topbar {
      align-items: flex-start;
      flex-direction: column;
    }
    .profile-grid {
      grid-template-columns: 1fr;
    }
    .profile-shell {
      padding: 16px 12px 40px;
    }
    .panel, .sheet-panel {
      padding: 18px;
      border-radius: 24px;
    }
  }
`;

const NAV_ITEMS = [
  ["Dashboard", "dashboard"],
  ["Hangouts", "create-hangout"],
  ["My Crew", "friend-groups"],
  ["Trips", "trip-planning"],
  ["Bill Split", "bill-split"],
  ["Ratings", "rate-outing"],
  ["Debrief", "debrief"],
];

function initialsFor(profile) {
  const seed = (profile?.name || profile?.username || "You").replace(/^@/, "").trim();
  return seed.slice(0, 2).toUpperCase() || "YO";
}

function weekSummary(availability) {
  const text = availabilityToText(availability);
  return text === "No availability saved" ? "No availability saved yet." : text;
}

export default function OutsidersProfile({ onNavigate, appData, setAppData }) {
  const profile = appData?.profile || DEFAULT_PROFILE;
  const notifications = appData?.notifications || [];
  const [draft, setDraft] = useState(() => profile);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const availabilitySummary = weekSummary(draft.availability);
  const unreadNotifications = notifications.filter((notification) => !notification.read);
  const availabilityReady = hasAvailability(draft.availability);

  useEffect(() => {
    setDraft(profile);
  }, [profile]);

  const updateField = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const saveProfile = async () => {
    setSaveError("");
    setSaving(true);

    const cleanUsername = draft.username.trim().replace(/^@/, "").toLowerCase();
    const nextProfile = {
      ...draft,
      username: cleanUsername,
    };

    setAppData?.((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        ...nextProfile,
      },
      groups: (prev.groups || []).map((group) => ({
        ...group,
        members: (group.members || []).map((member) => (
          member.name === prev.profile?.name || member.username === (prev.profile?.username ? `@${prev.profile.username}` : "")
            ? {
                ...member,
                name: nextProfile.name || member.name,
                username: cleanUsername ? `@${cleanUsername}` : member.username,
                initials: initialsFor(nextProfile),
                availability: nextProfile.availability,
              }
            : member
        )),
      })),
    }));

    if (isSupabaseConfigured) {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user || null;

      if (user) {
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: user.id,
          full_name: nextProfile.name.trim() || user.user_metadata?.full_name || user.email?.split("@")[0] || "You",
          username: cleanUsername || user.user_metadata?.username || user.email?.split("@")[0] || `user-${user.id.slice(0, 8)}`,
          email: nextProfile.email.trim() || user.email || "",
        });

        if (profileError) {
          setSaveError(profileError.message);
          setSaving(false);
          return;
        }

        const { error: availabilityError } = await supabase.rpc("save_my_availability", {
          next_availability: nextProfile.availability,
        });

        if (availabilityError) {
          setSaveError(availabilityError.message);
          setSaving(false);
          return;
        }

        const { error: authError } = await supabase.auth.updateUser({
          data: {
            full_name: nextProfile.name.trim(),
            username: cleanUsername,
            bio: nextProfile.bio.trim(),
            location: nextProfile.location.trim(),
            availability: nextProfile.availability,
          },
        });

        if (authError) {
          console.warn("Profile metadata update failed after profile + availability were saved:", authError.message);
        }
      }
    }

    setDraft(nextProfile);
    setSaved(true);
    setSaving(false);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="profile-root">
        <div className="profile-shell">
          <div className="topbar">
            <button type="button" className="brand-btn" onClick={() => onNavigate?.("dashboard")}>
              <div className="logo-mark">
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" fill="white"/></svg>
              </div>
              <div>
                <div style={{ font: "800 22px 'Sora', sans-serif" }}>Outsiders</div>
                <div style={{ fontSize: 12, color: "#7a8294" }}>Profile and availability</div>
              </div>
            </button>
            <div className="nav-row">
              {NAV_ITEMS.map(([label, target]) => (
                <button key={label} type="button" className={`nav-btn ${label === "Dashboard" ? "" : ""}`} onClick={() => onNavigate?.(target)}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="hero-grid">
            <section className="panel profile-card">
            <span className="eyebrow">{availabilityReady ? "Availability live" : "Availability missing"}</span>
              <div style={{ display: "flex", gap: 16, alignItems: "center", marginTop: 16 }}>
                <div className="avatar-circle">{initialsFor(draft)}</div>
                <div>
                  <h1 className="bangers" style={{ margin: "0 0 6px", fontSize: 34 }}>{draft.name || "Set up your profile"}</h1>
                  <p style={{ margin: "0 0 8px", color: "#667085", fontWeight: 700 }}>
                    {draft.username ? `@${draft.username.replace(/^@/, "")}` : "Pick a username so your crew recognizes you."}
                  </p>
                  <p style={{ margin: 0, color: "#475467", lineHeight: 1.6 }}>
                    {draft.bio || "Tell the crew a little about yourself, then fill out the availability sheet so planning can work around your week."}
                  </p>
                </div>
              </div>

              <div className="profile-grid">
                <div className="stat-tile">
                  <p className="stat-label">Weekly summary</p>
                  <p style={{ margin: 0, fontWeight: 700, lineHeight: 1.5 }}>{availabilitySummary}</p>
                </div>
                <div className="stat-tile">
                  <p className="stat-label">Notifications</p>
                  <p style={{ margin: "0 0 4px", font: "800 28px 'Sora', sans-serif" }}>{unreadNotifications.length}</p>
                  <p style={{ margin: 0, color: "#667085", fontWeight: 700 }}>Unread crew updates</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
                <button type="button" className="action-btn" onClick={saveProfile} disabled={saving}>{saving ? "Saving..." : "Save Profile"}</button>
                <button type="button" className="ghost-btn" onClick={() => onNavigate?.("friend-groups")}>Back To My Crew</button>
              </div>
              {saved ? <p style={{ margin: "14px 0 0", color: "#0f766e", fontWeight: 700 }}>Profile saved and availability updated.</p> : null}
              {saveError ? <p style={{ margin: "14px 0 0", color: "#b42318", fontWeight: 700 }}>{saveError}</p> : null}
            </section>

            <section className="panel">
              <div className="details-grid">
                <div className="field">
                  <label>Full Name</label>
                  <input value={draft.name} onChange={(event) => updateField("name", event.target.value)} placeholder="Your name" />
                </div>
                <div className="field">
                  <label>Username</label>
                  <input value={draft.username} onChange={(event) => updateField("username", event.target.value.replace(/^@/, ""))} placeholder="yourhandle" />
                </div>
                <div className="field">
                  <label>Email</label>
                  <input value={draft.email} onChange={(event) => updateField("email", event.target.value)} placeholder="you@example.com" />
                </div>
                <div className="field">
                  <label>Location</label>
                  <input value={draft.location} onChange={(event) => updateField("location", event.target.value)} placeholder="Brooklyn, NY" />
                </div>
                <div className="field" style={{ gridColumn: "1 / -1" }}>
                  <label>Bio</label>
                  <textarea value={draft.bio} onChange={(event) => updateField("bio", event.target.value)} placeholder="What kind of hangouts are you into?" />
                </div>
              </div>

              {!availabilityReady ? (
                <div className="notice-card" style={{ marginTop: 18 }}>
                  <strong style={{ display: "block", marginBottom: 6 }}>Your weekly availability is required.</strong>
                  <span>Tap or drag across the schedule below to mark when you are free. The rest of the app stays locked until this sheet is filled in.</span>
                </div>
              ) : null}
            </section>
          </div>

          <AvailabilitySheet
            value={draft.availability}
            onChange={(nextAvailability) => setDraft((prev) => ({ ...prev, availability: nextAvailability }))}
            title="Weekly availability sheet"
            subtitle="This is your dedicated availability section as a logged-in user. Mark every half-hour block when you would realistically say yes to a crew plan."
            required
            footerAction={<button type="button" className="availability-btn primary" onClick={saveProfile} disabled={saving}>{saving ? "Saving..." : "Save availability"}</button>}
          />

          <section className="panel">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
              <div>
                <h3 style={{ margin: "0 0 6px", font: "800 24px 'Sora', sans-serif" }}>Crew notifications</h3>
                <p style={{ margin: 0, color: "#667085" }}>Proposal alerts and crew updates show up here.</p>
              </div>
              {unreadNotifications.length ? (
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => setAppData?.((prev) => ({
                    ...prev,
                    notifications: prev.notifications.map((notification) => ({ ...notification, read: true })),
                  }))}
                >
                  Mark all read
                </button>
              ) : null}
            </div>
            <div className="notif-list">
              {notifications.length ? notifications.map((notification) => (
                <div key={notification.id} className="notif-item" style={{ opacity: notification.read ? 0.68 : 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                  <strong>{notification.message}</strong>
                    {!notification.read ? <span className="slot-chip" style={{ background: "#eefdf5", color: "#0f766e" }}>New</span> : null}
                  </div>
                  <p style={{ margin: "8px 0 0", color: "#667085", fontSize: 14 }}>
                    {notification.groupName ? `${notification.groupName} · ` : ""}{new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              )) : (
                <div className="notif-item">
                  <strong>No notifications yet.</strong>
                  <p style={{ margin: "8px 0 0", color: "#667085" }}>When someone proposes a hangout in one of your crews, it will show up here.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
