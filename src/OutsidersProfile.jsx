import { useEffect, useRef, useState } from "react";
import { isSupabaseConfigured, supabase } from "./supabase";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Nunito:wght@400;600;700;800;900&display=swap');
  * { box-sizing: border-box; }
  body { background: #f5f3ee; margin: 0; }
  .root { font-family: 'Nunito', sans-serif; background: #f5f3ee; color: #1a1a2e; min-height: 100vh; display: flex; flex-direction: column; }
  .root::before { content: ''; position: fixed; inset: 0; background-image: radial-gradient(circle, #1a1a2e 1px, transparent 1px); background-size: 24px 24px; opacity: 0.03; pointer-events: none; z-index: 0; }
  .bangers { font-family: 'Bangers', cursive; letter-spacing: 0.04em; }
  .top-nav { position: sticky; top: 0; z-index: 50; background: #fffdf9; border-bottom: 4px solid #1a1a2e; box-shadow: 0 4px 0 #1a1a2e; }
  .logo-mark { width: 36px; height: 36px; background: #ff6b6b; border: 3px solid #1a1a2e; border-radius: 10px; display: flex; align-items: center; justify-content: center; box-shadow: 3px 3px 0 #1a1a2e; }
  .logo-link { display: inline-flex; align-items: center; gap: 10px; background: none; border: none; padding: 0; cursor: pointer; }
  .layout { display: flex; flex: 1; position: relative; z-index: 1; }
  .sidebar { width: 220px; flex-shrink: 0; background: #fffdf9; border-right: 4px solid #1a1a2e; padding: 24px 16px; display: flex; flex-direction: column; gap: 6px; position: sticky; top: 68px; height: calc(100vh - 68px); overflow-y: auto; }
  .nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 10px; cursor: pointer; font-weight: 800; font-size: 14px; color: #666; border: 2.5px solid transparent; transition: all 0.15s; }
  .nav-item:hover { background: #f5f3ee; color: #1a1a2e; border-color: #e0dbd0; }
  .nav-item.active { background: #fff; color: #1a1a2e; border: 2.5px solid #1a1a2e; box-shadow: 3px 3px 0 #1a1a2e; }
  .nav-section-label { font-family: 'Bangers', cursive; font-size: 12px; letter-spacing: 0.1em; color: #bbb; padding: 8px 14px 4px; text-transform: uppercase; }
  .main { flex: 1; padding: 28px 32px; overflow-y: auto; }
  .card { background: #fff; border: 3px solid #1a1a2e; border-radius: 16px; box-shadow: 5px 5px 0 #1a1a2e; padding: 22px 24px; }
  .btn-primary { background: #ff6b6b; color: #fff; border: 3px solid #1a1a2e; cursor: pointer; font-family: 'Bangers', cursive; letter-spacing: 0.08em; border-radius: 10px; box-shadow: 4px 4px 0 #1a1a2e; transition: transform 0.12s, box-shadow 0.12s; font-size: 16px; padding: 10px 20px; display: inline-flex; align-items: center; gap: 8px; }
  .btn-primary:hover { transform: translate(-2px,-2px); box-shadow: 6px 6px 0 #1a1a2e; }
  .btn-secondary { background: #ffd93d; color: #1a1a2e; border: 3px solid #1a1a2e; cursor: pointer; font-family: 'Bangers', cursive; letter-spacing: 0.08em; border-radius: 10px; box-shadow: 4px 4px 0 #1a1a2e; transition: transform 0.12s, box-shadow 0.12s; font-size: 15px; padding: 9px 18px; display: inline-flex; align-items: center; gap: 8px; }
  .btn-secondary:hover { transform: translate(-2px,-2px); box-shadow: 6px 6px 0 #1a1a2e; }
  .btn-outline { background: #fff; color: #1a1a2e; border: 3px solid #1a1a2e; cursor: pointer; font-family: 'Bangers', cursive; letter-spacing: 0.08em; border-radius: 10px; box-shadow: 3px 3px 0 #1a1a2e; transition: transform 0.12s, box-shadow 0.12s; font-size: 14px; padding: 8px 16px; display: inline-flex; align-items: center; gap: 6px; }
  .btn-outline:hover { transform: translate(-2px,-2px); box-shadow: 5px 5px 0 #1a1a2e; }
  .btn-danger { background: #fff; color: #ff6b6b; border: 3px solid #ff6b6b; cursor: pointer; font-family: 'Bangers', cursive; letter-spacing: 0.06em; border-radius: 10px; box-shadow: 3px 3px 0 #ff6b6b; font-size: 15px; padding: 10px 20px; display: inline-flex; align-items: center; gap: 8px; transition: background 0.15s; }
  .btn-danger:hover { background: #fde8e8; }
  .form-input { width: 100%; padding: 12px 14px; font-size: 14px; font-family: 'Nunito', sans-serif; font-weight: 700; color: #1a1a2e; background: #fffdf9; border: 3px solid #1a1a2e; border-radius: 10px; outline: none; transition: box-shadow 0.15s, border-color 0.15s; box-shadow: 3px 3px 0 #1a1a2e; resize: none; }
  .form-input:focus { border-color: #ff6b6b; box-shadow: 3px 3px 0 #ff6b6b; }
  .form-label { display: block; font-family: 'Bangers', cursive; font-size: 15px; letter-spacing: 0.05em; color: #1a1a2e; margin-bottom: 6px; }
  .avatar-big { width: 100px; height: 100px; border-radius: 50%; border: 4px solid #1a1a2e; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 32px; color: #fff; flex-shrink: 0; box-shadow: 5px 5px 0 #1a1a2e; overflow: hidden; }
  .badge { display: inline-flex; align-items: center; padding: 4px 12px; border-radius: 8px; font-family: 'Bangers', cursive; font-size: 13px; letter-spacing: 0.05em; border: 2px solid; }
  .stat-box { background: #fff; border: 3px solid #1a1a2e; border-radius: 14px; padding: 16px 18px; box-shadow: 4px 4px 0 #1a1a2e; text-align: center; }
  .tab { padding: 9px 20px; font-family: 'Bangers', cursive; font-size: 16px; letter-spacing: 0.05em; border: 3px solid transparent; border-radius: 10px; cursor: pointer; background: none; color: #888; transition: all 0.15s; }
  .tab.active { background: #fff; color: #1a1a2e; border-color: #1a1a2e; box-shadow: 3px 3px 0 #1a1a2e; }
  .profile-chip { display: flex; align-items: center; gap: 8px; background: #fff; border: 3px solid #1a1a2e; border-radius: 50px; padding: 4px 14px 4px 4px; box-shadow: 3px 3px 0 #1a1a2e; cursor: pointer; }
  .notif-dot { width: 8px; height: 8px; background: #ff6b6b; border: 2px solid #1a1a2e; border-radius: 50%; position: absolute; top: -2px; right: -2px; }
  .comic-tag { display: inline-block; background: #ffd93d; border: 2px solid #1a1a2e; border-radius: 6px; padding: 1px 10px; font-family: 'Bangers', cursive; font-size: 12px; letter-spacing: 0.06em; box-shadow: 2px 2px 0 #1a1a2e; transform: rotate(-2deg); }
  .achievement { display: flex; align-items: center; gap: 14px; padding: 12px 0; border-bottom: 2px dashed #f0ebe0; }
  .achievement:last-child { border-bottom: none; }
  .toggle { width: 48px; height: 26px; border-radius: 99px; border: 3px solid #1a1a2e; cursor: pointer; transition: background 0.2s; position: relative; flex-shrink: 0; box-shadow: 2px 2px 0 #1a1a2e; }
  .toggle-thumb { width: 16px; height: 16px; background: #fff; border-radius: 50%; border: 2px solid #1a1a2e; position: absolute; top: 2px; transition: left 0.2s; }
  .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
`;

const IconLogoMark = () => <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" fill="white"/></svg>;
const IconHome = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IconCalendar = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconUsers = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconPlane = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>;
const IconSplit = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const IconHeart = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const IconStar = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IconBell = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const IconCamera = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;

const NAV_ITEMS = [
  { icon: <IconHome />, label: "Dashboard" },
  { icon: <IconCalendar />, label: "Hangouts" },
  { icon: <IconUsers />, label: "My Crew" },
  { icon: <IconPlane />, label: "Trips" },
  { icon: <IconSplit />, label: "Bill Split" },
  { icon: <IconStar />, label: "Ratings" },
  { icon: <IconHeart />, label: "Debrief" },
];

const ACHIEVEMENTS = [];

const NOTIFICATIONS = [
  { key: "hangouts", label: "New hangout invites", on: false },
  { key: "votes", label: "Voting reminders", on: false },
  { key: "bills", label: "Bill split requests", on: false },
  { key: "debrief", label: "Debrief session requests", on: false },
  { key: "activity", label: "Crew activity updates", on: false },
];

const NAV_TARGETS = {
  "Dashboard": "dashboard",
  "Hangouts": "create-hangout",
  "My Crew": "friend-groups",
  "Trips": "trip-planning",
  "Bill Split": "bill-split",
  "Ratings": "rate-outing",
  "Debrief": "debrief",
};

const PROFILE_STORAGE_KEY = "outsiders-profile";
const DEFAULT_PROFILE = { name: "", username: "", bio: "", location: "", email: "" };

function readStoredProfile() {
  if (typeof window === "undefined") {
    return { profile: DEFAULT_PROFILE, avatar: null };
  }

  try {
    const saved = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!saved) {
      return { profile: DEFAULT_PROFILE, avatar: null };
    }

    const parsed = JSON.parse(saved);
    return {
      profile: { ...DEFAULT_PROFILE, ...(parsed?.profile || {}) },
      avatar: typeof parsed?.avatar === "string" ? parsed.avatar : null,
    };
  } catch {
    return { profile: DEFAULT_PROFILE, avatar: null };
  }
}

function persistProfile(profile, avatar) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify({ profile, avatar }));
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read image."));
    reader.readAsDataURL(file);
  });
}

async function resizeImage(file) {
  const source = await fileToDataUrl(file);

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const maxSide = 512;
      const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");

      if (!context) {
        reject(new Error("Could not prepare image."));
        return;
      }

      context.drawImage(image, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    image.onerror = () => reject(new Error("Could not process image."));
    image.src = source;
  });
}

export default function OutsidersProfile({ onNavigate }) {
  const initialStoredProfile = readStoredProfile();
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [activeTab, setActiveTab] = useState("Profile");
  const [avatar, setAvatar] = useState(initialStoredProfile.avatar);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState(initialStoredProfile.profile);
  const [editForm, setEditForm] = useState(initialStoredProfile.profile);
  const [notifs, setNotifs] = useState(NOTIFICATIONS);
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    persistProfile(profile, avatar);
  }, [avatar, profile]);

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;

    let isActive = true;

    async function loadCurrentUser() {
      const { data } = await supabase.auth.getUser();
      if (isActive) {
        setCurrentUser(data.user || null);
      }
    }

    loadCurrentUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
    });

    return () => {
      isActive = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !currentUser?.id) return undefined;

    let isActive = true;

    async function loadRemoteProfile() {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, username, email, avatar_url")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (!isActive || !data) return;

      setProfile((prev) => ({
        ...prev,
        name: data.full_name || prev.name || currentUser.user_metadata?.full_name || "",
        username: data.username || prev.username || currentUser.user_metadata?.username || "",
        email: data.email || prev.email || currentUser.email || "",
      }));
      setEditForm((prev) => ({
        ...prev,
        name: data.full_name || prev.name || currentUser.user_metadata?.full_name || "",
        username: data.username || prev.username || currentUser.user_metadata?.username || "",
        email: data.email || prev.email || currentUser.email || "",
      }));

      if (data.avatar_url) {
        setAvatar((prev) => prev || data.avatar_url);
      }
    }

    loadRemoteProfile();
    return () => {
      isActive = false;
    };
  }, [currentUser]);

  async function saveProfile(nextProfile, nextAvatar = avatar) {
    setSaveError("");
    setIsSaving(true);

    const cleanedProfile = {
      ...nextProfile,
      name: nextProfile.name.trim(),
      username: nextProfile.username.trim().replace(/^@/, ""),
      bio: nextProfile.bio.trim(),
      location: nextProfile.location.trim(),
      email: nextProfile.email.trim(),
    };

    setProfile(cleanedProfile);
    setEditForm(cleanedProfile);
    persistProfile(cleanedProfile, nextAvatar);

    if (isSupabaseConfigured && currentUser?.id) {
      const { error } = await supabase.from("profiles").upsert({
        id: currentUser.id,
        full_name: cleanedProfile.name,
        username: cleanedProfile.username,
        email: cleanedProfile.email || currentUser.email || "",
        avatar_url: nextAvatar,
      });

      if (error) {
        setSaveError(error.message);
        setIsSaving(false);
        return false;
      }
    }

    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setIsSaving(false);
    return true;
  }

  const handleSave = () => saveProfile(editForm);

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setSaveError("");
      const nextAvatar = await resizeImage(file);
      setAvatar(nextAvatar);
      await saveProfile(profile, nextAvatar);
    } catch (error) {
      setSaveError(error.message || "Could not save that image.");
    } finally {
      event.target.value = "";
    }
  };

  const toggleNotif = (key) => setNotifs(prev => prev.map(n => n.key === key ? { ...n, on: !n.on } : n));
  const handleNav = (label) => {
    setActiveNav(label);
    onNavigate?.(NAV_TARGETS[label] || "profile");
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="root">
        <nav className="top-nav">
          <div style={{ padding: "0 24px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <button type="button" className="logo-link" onClick={() => onNavigate?.("dashboard")} aria-label="Go to home">
              <div className="logo-mark"><IconLogoMark /></div>
              <span className="bangers" style={{ fontSize: 26, color: "#1a1a2e" }}>Outsiders</span>
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <button
                onClick={() => onNavigate?.("landing")}
                style={{ background: "#ffd93d", color: "#1a1a2e", border: "3px solid #1a1a2e", borderRadius: 10, padding: "8px 14px", fontFamily: "'Bangers', cursive", fontSize: 14, letterSpacing: "0.05em", cursor: "pointer", boxShadow: "3px 3px 0 #1a1a2e" }}
              >
                Log Out
              </button>
              <div style={{ position: "relative", cursor: "pointer" }} onClick={() => setActiveTab("Notifications")}><IconBell /><div className="notif-dot" /></div>
              <div className="profile-chip" onClick={() => setActiveTab("Achievements")}>
                <div style={{ width: 30, height: 30, background: "#ff6b6b", border: "2px solid #1a1a2e", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 11, color: "#fff" }}>YOU</div>
                <span style={{ fontWeight: 800, fontSize: 14 }}>You</span>
              </div>
            </div>
          </div>
        </nav>

        <div className="layout">
          <aside className="sidebar">
            <p className="nav-section-label">Menu</p>
            {NAV_ITEMS.map(item => (
              <div key={item.label} className={`nav-item ${activeNav === item.label ? "active" : ""}`} onClick={() => handleNav(item.label)}>
                {item.icon} {item.label}
              </div>
            ))}
          </aside>

          <main className="main">
            <div style={{ marginBottom: 24 }}>
              <span className="comic-tag">That's you! 👤</span>
              <h1 className="bangers" style={{ fontSize: 34, margin: "6px 0 4px" }}>My Profile 👤</h1>
            </div>

            {/* Profile hero card */}
            <div className="card" style={{ background: "#fde8f0", borderColor: "#ff6b9d", boxShadow: "5px 5px 0 #ff6b9d", marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
                <div style={{ position: "relative" }}>
                  <div className="avatar-big" style={{ background: "#ff6b6b" }}>
                    {avatar ? <img src={avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "?"}
                  </div>
                  <button onClick={() => fileRef.current.click()} style={{ position: "absolute", bottom: 0, right: 0, width: 32, height: 32, background: "#1a1a2e", border: "2px solid #fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <IconCamera />
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
                </div>
                <div style={{ flex: 1 }}>
                  <h2 className="bangers" style={{ fontSize: 28, margin: "0 0 4px" }}>{profile.name || "Set up your profile"}</h2>
                  <p style={{ fontSize: 15, fontWeight: 800, color: "#888", margin: "0 0 6px" }}>{profile.username ? `@${profile.username}` : "No username yet"}</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#555", margin: "0 0 10px" }}>{profile.bio || "Add a short bio so people know who you are."}</p>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <span className="badge" style={{ background: "#fff", color: "#ff6b9d", borderColor: "#ff6b9d" }}>📍 {profile.location || "No location yet"}</span>
                    <span className="badge" style={{ background: "#fff", color: "#4ecdc4", borderColor: "#4ecdc4" }}>✨ Profile in progress</span>
                  </div>
                </div>
                <button className="btn-secondary" onClick={() => { setEditForm({ ...profile }); setEditing(true); }}>✏️ Edit Profile</button>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px,1fr))", gap: 14, marginBottom: 24 }}>
              {[
                { emoji: "🗓", label: "Hangouts", value: "0", color: "#ff9a3c", bg: "#fff4e6", border: "#ff9a3c" },
                { emoji: "✈️", label: "Trips", value: "0", color: "#4ecdc4", bg: "#e8f4fd", border: "#4ecdc4" },
                { emoji: "👥", label: "Groups", value: "0", color: "#51cf66", bg: "#e8fde8", border: "#51cf66" },
                { emoji: "⭐", label: "Avg Rating", value: "—", color: "#ffd93d", bg: "#fffde8", border: "#ffd93d" },
                { emoji: "💸", label: "Bills Paid", value: "0", color: "#a29bfe", bg: "#f3e8fd", border: "#9b59b6" },
              ].map(s => (
                <div key={s.label} className="stat-box" style={{ background: s.bg, borderColor: s.border, boxShadow: `4px 4px 0 ${s.border}` }}>
                  <p style={{ fontSize: 22, margin: "0 0 4px" }}>{s.emoji}</p>
                  <p className="bangers" style={{ fontSize: 26, margin: 0, color: s.color }}>{s.value}</p>
                  <p style={{ fontSize: 11, fontWeight: 800, color: "#888", margin: 0 }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 8, background: "#f5f3ee", padding: 6, borderRadius: 12, border: "3px solid #1a1a2e", width: "fit-content", boxShadow: "3px 3px 0 #1a1a2e", marginBottom: 24 }}>
              {["Achievements", "Settings", "Notifications"].map(t => (
                <button key={t} className={`tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>{t}</button>
              ))}
            </div>

            {activeTab === "Achievements" && (
              <div className="card">
                <div className="section-header">
                  <h3 className="bangers" style={{ fontSize: 22, margin: 0 }}>Achievements 🏆</h3>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#888" }}>{ACHIEVEMENTS.filter(a => a.earned).length}/{ACHIEVEMENTS.length} earned</span>
                </div>
                {ACHIEVEMENTS.length === 0 ? (
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#888", margin: 0 }}>No achievements yet. They’ll show up once you start using the app.</p>
                ) : ACHIEVEMENTS.map((a, i) => (
                  <div key={i} className="achievement" style={{ opacity: a.earned ? 1 : 0.4 }}>
                    <div style={{ width: 52, height: 52, background: a.earned ? a.color : "#f0ebe0", border: `3px solid ${a.earned ? a.border : "#ccc"}`, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: a.earned ? `4px 4px 0 ${a.border}` : "none", flexShrink: 0 }}>{a.emoji}</div>
                    <div style={{ flex: 1 }}>
                      <p className="bangers" style={{ fontSize: 17, margin: 0, color: "#1a1a2e" }}>{a.title}</p>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#888", margin: 0 }}>{a.desc}</p>
                    </div>
                    {a.earned && <span className="badge" style={{ background: "#e8fde8", color: "#51cf66", borderColor: "#51cf66" }}>✓ Earned</span>}
                    {!a.earned && <span className="badge" style={{ background: "#f0ebe0", color: "#aaa", borderColor: "#ccc" }}>Locked</span>}
                  </div>
                ))}
              </div>
            )}

            {activeTab === "Settings" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div className="card">
                  <h3 className="bangers" style={{ fontSize: 20, margin: "0 0 20px" }}>Account Settings ⚙️</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {[
                      { label: "Full Name", key: "name", type: "text" },
                      { label: "Username", key: "username", type: "text" },
                      { label: "Email", key: "email", type: "email" },
                      { label: "Location", key: "location", type: "text" },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="form-label">{f.label}</label>
                        <input className="form-input" type={f.type} value={profile[f.key]} onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))} />
                      </div>
                    ))}
                    <div>
                      <label className="form-label">Bio</label>
                      <textarea className="form-input" rows={3} value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} />
                    </div>
                    {saveError && <p style={{ fontSize: 13, fontWeight: 800, color: "#ff6b6b", margin: 0 }}>{saveError}</p>}
                    {saved && <p className="bangers" style={{ fontSize: 16, color: "#51cf66", margin: 0, letterSpacing: "0.04em" }}>✅ Changes saved!</p>}
                    <div style={{ display: "flex", gap: 12 }}>
                      <button className="btn-primary" onClick={() => saveProfile(profile)} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Changes ✅"}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="card" style={{ background: "#fde8e8", borderColor: "#ff6b6b", boxShadow: "5px 5px 0 #ff6b6b" }}>
                  <h3 className="bangers" style={{ fontSize: 20, margin: "0 0 10px", color: "#ff6b6b" }}>Danger Zone ⚠️</h3>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#888", margin: "0 0 16px" }}>These actions can't be undone. Be careful.</p>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <button className="btn-danger" onClick={() => window.alert("Password change is reserved for the real auth flow, but the button is connected now.")}>🔒 Change Password</button>
                    <button className="btn-danger" onClick={() => {
                      if (window.confirm("Delete account? Demo mode will stop before anything destructive happens.")) {
                        window.alert("Demo mode is keeping this account intact.");
                      }
                    }}>🗑 Delete Account</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Notifications" && (
              <div className="card">
                <h3 className="bangers" style={{ fontSize: 20, margin: "0 0 20px" }}>Notifications 🔔</h3>
                {notifs.map(n => (
                  <div key={n.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: "2px dashed #f0ebe0" }}>
                    <span style={{ fontSize: 15, fontWeight: 800 }}>{n.label}</span>
                    <div className="toggle" style={{ background: n.on ? "#ff6b6b" : "#e0dbd0" }} onClick={() => toggleNotif(n.key)}>
                      <div className="toggle-thumb" style={{ left: n.on ? "22px" : "2px" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>

        {/* Edit modal */}
        {editing && (
          <div className="modal-overlay" onClick={() => setEditing(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <button className="close-btn" onClick={() => setEditing(false)}>✕</button>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <span className="comic-tag">Looking good! ✨</span>
                <h2 className="bangers" style={{ fontSize: 32, margin: "8px 0 4px" }}>Edit Profile</h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[{ label: "Full Name", key: "name", type: "text" }, { label: "Username", key: "username", type: "text" }, { label: "Location", key: "location", type: "text" }].map(f => (
                  <div key={f.key}>
                    <label className="form-label">{f.label}</label>
                    <input className="form-input" type={f.type} value={editForm[f.key]} onChange={e => setEditForm(p => ({ ...p, [f.key]: e.target.value }))} />
                  </div>
                ))}
                <div>
                  <label className="form-label">Bio</label>
                  <textarea className="form-input" rows={3} value={editForm.bio} onChange={e => setEditForm(p => ({ ...p, bio: e.target.value }))} />
                </div>
                {saveError && <p style={{ fontSize: 13, fontWeight: 800, color: "#ff6b6b", margin: 0 }}>{saveError}</p>}
                <button className="btn-primary" style={{ width: "100%", justifyContent: "center", fontSize: 20, padding: "14px" }} onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes ✅"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
