import { useState } from "react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Nunito:wght@400;600;700;800;900&display=swap');

  * { box-sizing: border-box; }
  body { background: #f5f3ee; margin: 0; }

  .root {
    font-family: 'Nunito', sans-serif;
    background: #f5f3ee;
    color: #1a1a2e;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .root::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: radial-gradient(circle, #1a1a2e 1px, transparent 1px);
    background-size: 24px 24px;
    opacity: 0.03;
    pointer-events: none;
    z-index: 0;
  }

  .bangers { font-family: 'Bangers', cursive; letter-spacing: 0.04em; }

  .top-nav {
    position: sticky; top: 0; z-index: 50;
    background: #fffdf9;
    border-bottom: 4px solid #1a1a2e;
    box-shadow: 0 4px 0 #1a1a2e;
  }

  .logo-mark {
    width: 36px; height: 36px;
    background: #ff6b6b;
    border: 3px solid #1a1a2e;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 3px 3px 0 #1a1a2e;
  }

  .layout { display: flex; flex: 1; position: relative; z-index: 1; }

  .sidebar {
    width: 220px; flex-shrink: 0;
    background: #fffdf9;
    border-right: 4px solid #1a1a2e;
    padding: 24px 16px;
    display: flex; flex-direction: column; gap: 6px;
    position: sticky; top: 68px;
    height: calc(100vh - 68px);
    overflow-y: auto;
  }

  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; border-radius: 10px;
    cursor: pointer; font-weight: 800; font-size: 14px;
    color: #666; border: 2.5px solid transparent;
    transition: all 0.15s;
  }
  .nav-item:hover { background: #f5f3ee; color: #1a1a2e; border-color: #e0dbd0; }
  .nav-item.active { background: #fff; color: #1a1a2e; border: 2.5px solid #1a1a2e; box-shadow: 3px 3px 0 #1a1a2e; }

  .nav-section-label {
    font-family: 'Bangers', cursive;
    font-size: 12px; letter-spacing: 0.1em;
    color: #bbb; padding: 8px 14px 4px;
    text-transform: uppercase;
  }

  .main { flex: 1; padding: 28px 32px; overflow-y: auto; }

  .card {
    background: #fff;
    border: 3px solid #1a1a2e;
    border-radius: 16px;
    box-shadow: 5px 5px 0 #1a1a2e;
    padding: 22px 24px;
  }

  .group-card {
    background: #fff;
    border: 3px solid #1a1a2e;
    border-radius: 16px;
    box-shadow: 5px 5px 0 #1a1a2e;
    padding: 20px 22px;
    transition: transform 0.15s, box-shadow 0.15s;
    cursor: pointer;
  }
  .group-card:hover { transform: translate(-2px,-2px); box-shadow: 7px 7px 0 #1a1a2e; }

  .btn-primary {
    background: #ff6b6b; color: #fff;
    border: 3px solid #1a1a2e;
    cursor: pointer;
    font-family: 'Bangers', cursive;
    letter-spacing: 0.08em;
    border-radius: 10px;
    box-shadow: 4px 4px 0 #1a1a2e;
    transition: transform 0.12s, box-shadow 0.12s;
    font-size: 16px; padding: 10px 20px;
    display: inline-flex; align-items: center; gap: 8px;
  }
  .btn-primary:hover { transform: translate(-2px,-2px); box-shadow: 6px 6px 0 #1a1a2e; }
  .btn-primary:active { transform: translate(2px,2px); box-shadow: 2px 2px 0 #1a1a2e; }

  .btn-secondary {
    background: #ffd93d; color: #1a1a2e;
    border: 3px solid #1a1a2e;
    cursor: pointer;
    font-family: 'Bangers', cursive;
    letter-spacing: 0.08em;
    border-radius: 10px;
    box-shadow: 4px 4px 0 #1a1a2e;
    transition: transform 0.12s, box-shadow 0.12s;
    font-size: 16px; padding: 10px 20px;
    display: inline-flex; align-items: center; gap: 8px;
  }
  .btn-secondary:hover { transform: translate(-2px,-2px); box-shadow: 6px 6px 0 #1a1a2e; }

  .btn-outline {
    background: #fff; color: #1a1a2e;
    border: 3px solid #1a1a2e;
    cursor: pointer;
    font-family: 'Bangers', cursive;
    letter-spacing: 0.08em;
    border-radius: 10px;
    box-shadow: 4px 4px 0 #1a1a2e;
    transition: transform 0.12s, box-shadow 0.12s;
    font-size: 15px; padding: 9px 18px;
    display: inline-flex; align-items: center; gap: 8px;
  }
  .btn-outline:hover { transform: translate(-2px,-2px); box-shadow: 6px 6px 0 #1a1a2e; }

  .btn-danger {
    background: #fff; color: #ff6b6b;
    border: 2px solid #ff6b6b;
    cursor: pointer;
    font-family: 'Bangers', cursive;
    letter-spacing: 0.06em;
    border-radius: 8px;
    transition: background 0.15s;
    font-size: 13px; padding: 6px 12px;
  }
  .btn-danger:hover { background: #fde8e8; }

  .form-input {
    width: 100%;
    padding: 12px 16px;
    font-size: 15px;
    font-family: 'Nunito', sans-serif;
    font-weight: 700; color: #1a1a2e;
    background: #fffdf9;
    border: 3px solid #1a1a2e;
    border-radius: 10px; outline: none;
    transition: box-shadow 0.15s, border-color 0.15s;
    box-shadow: 4px 4px 0 #1a1a2e;
  }
  .form-input:focus { border-color: #ff6b6b; box-shadow: 4px 4px 0 #ff6b6b; }
  .form-input::placeholder { color: #bbb; font-weight: 600; }

  .form-label {
    display: block;
    font-family: 'Bangers', cursive;
    font-size: 16px; letter-spacing: 0.05em;
    color: #1a1a2e; margin-bottom: 8px;
  }

  .avatar {
    width: 38px; height: 38px; border-radius: 50%;
    border: 2.5px solid #1a1a2e;
    display: flex; align-items: center; justify-content: center;
    font-weight: 900; font-size: 13px; color: #fff;
    flex-shrink: 0; box-shadow: 2px 2px 0 #1a1a2e;
  }

  .avatar-sm {
    width: 28px; height: 28px; border-radius: 50%;
    border: 2px solid #1a1a2e;
    display: flex; align-items: center; justify-content: center;
    font-weight: 900; font-size: 10px; color: #fff;
    flex-shrink: 0;
  }

  .badge {
    display: inline-flex; align-items: center;
    padding: 3px 10px; border-radius: 6px;
    font-family: 'Bangers', cursive;
    font-size: 12px; letter-spacing: 0.05em; border: 2px solid;
  }

  .member-row {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 0; border-bottom: 2px dashed #f0ebe0;
  }
  .member-row:last-child { border-bottom: none; }

  .pending-row {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 0; border-bottom: 2px dashed #f0ebe0;
  }
  .pending-row:last-child { border-bottom: none; }

  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 100;
    display: flex; align-items: center; justify-content: center;
    padding: 24px;
  }

  .modal {
    background: #fff;
    border: 4px solid #1a1a2e;
    border-radius: 20px;
    box-shadow: 10px 10px 0 #1a1a2e;
    padding: 36px 32px;
    width: 100%; max-width: 480px;
    position: relative;
  }

  .close-btn {
    position: absolute; top: 16px; right: 16px;
    background: #f5f3ee; border: 2px solid #1a1a2e;
    border-radius: 50%; width: 32px; height: 32px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 16px;
    box-shadow: 2px 2px 0 #1a1a2e;
  }

  .comic-tag {
    display: inline-block;
    background: #ffd93d; border: 2px solid #1a1a2e;
    border-radius: 6px; padding: 1px 10px;
    font-family: 'Bangers', cursive; font-size: 12px;
    letter-spacing: 0.06em; box-shadow: 2px 2px 0 #1a1a2e;
    transform: rotate(-2deg); margin-bottom: 10px;
  }

  .link-box {
    background: #fffdf9; border: 3px solid #1a1a2e;
    border-radius: 10px; padding: 10px 14px;
    font-size: 13px; font-weight: 800; color: #555;
    word-break: break-all; box-shadow: 3px 3px 0 #1a1a2e;
  }

  .error-msg {
    font-family: 'Bangers', cursive;
    font-size: 14px; color: #ff6b6b; margin-top: 6px;
    letter-spacing: 0.04em;
  }

  .tab {
    padding: 8px 18px;
    font-family: 'Bangers', cursive;
    font-size: 16px; letter-spacing: 0.05em;
    border: 3px solid transparent;
    border-radius: 10px; cursor: pointer;
    background: none; color: #888;
    transition: all 0.15s;
  }
  .tab.active {
    background: #fff; color: #1a1a2e;
    border-color: #1a1a2e;
    box-shadow: 3px 3px 0 #1a1a2e;
  }

  .section-header {
    display: flex; align-items: center;
    justify-content: space-between; margin-bottom: 16px;
  }

  .profile-chip {
    display: flex; align-items: center; gap: 8px;
    background: #fff; border: 3px solid #1a1a2e;
    border-radius: 50px; padding: 4px 14px 4px 4px;
    box-shadow: 3px 3px 0 #1a1a2e; cursor: pointer;
  }

  .notif-dot {
    width: 8px; height: 8px; background: #ff6b6b;
    border: 2px solid #1a1a2e; border-radius: 50%;
    position: absolute; top: -2px; right: -2px;
  }
`;

const GROUP_COLORS = [
  { bg: "#fff4e6", border: "#ff9a3c", avatar: "#ff9a3c" },
  { bg: "#e8f4fd", border: "#4ecdc4", avatar: "#4ecdc4" },
  { bg: "#fde8f0", border: "#ff6b9d", avatar: "#ff6b9d" },
  { bg: "#e8fde8", border: "#51cf66", avatar: "#51cf66" },
  { bg: "#f3e8fd", border: "#9b59b6", avatar: "#9b59b6" },
];

const AVATAR_COLORS = ["#ff6b6b", "#4ecdc4", "#a29bfe", "#ffd93d", "#51cf66", "#ff6b9d", "#ff9a3c"];

const INITIAL_GROUPS = [
  {
    id: 1, name: "College Crew 🎓", emoji: "🎓",
    members: [
      { initials: "JD", name: "Jordan (You)", role: "Admin" },
      { initials: "AL", name: "Alex Lee", role: "Member" },
      { initials: "MK", name: "Maya Khan", role: "Member" },
      { initials: "RB", name: "Ryan Brooks", role: "Member" },
    ],
    pending: [{ initials: "TW", name: "Taylor Wu", username: "@taylorwu" }],
    color: GROUP_COLORS[0],
    code: "COL123",
  },
  {
    id: 2, name: "Work Pals 💼", emoji: "💼",
    members: [
      { initials: "JD", name: "Jordan (You)", role: "Admin" },
      { initials: "SM", name: "Sam Martinez", role: "Member" },
      { initials: "KL", name: "Kim Li", role: "Member" },
    ],
    pending: [],
    color: GROUP_COLORS[1],
    code: "WRK456",
  },
];

const IconLogoMark = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
    <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" fill="white"/>
  </svg>
);
const IconHome = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IconCalendar = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconUsers = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconPlane = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>;
const IconSplit = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const IconHeart = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const IconStar = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IconBell = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const IconPlus = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconCopy = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
const IconCheck = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;

const NAV_ITEMS = [
  { icon: <IconHome />, label: "Dashboard" },
  { icon: <IconCalendar />, label: "Hangouts" },
  { icon: <IconUsers />, label: "My Crew", active: true },
  { icon: <IconPlane />, label: "Trips" },
  { icon: <IconSplit />, label: "Bill Split" },
  { icon: <IconStar />, label: "Ratings" },
  { icon: <IconHeart />, label: "Debrief" },
];

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function OutsidersFriendGroups() {
  const [groups, setGroups] = useState(INITIAL_GROUPS);
  const [selectedGroup, setSelectedGroup] = useState(INITIAL_GROUPS[0]);
  const [activeTab, setActiveTab] = useState("Members");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupEmoji, setNewGroupEmoji] = useState("👥");
  const [inviteUsername, setInviteUsername] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [inviteSent, setInviteSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [createError, setCreateError] = useState("");
  const [activeNav, setActiveNav] = useState("My Crew");

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) { setCreateError("Give your group a name!"); return; }
    const newGroup = {
      id: Date.now(),
      name: `${newGroupName.trim()} ${newGroupEmoji}`,
      emoji: newGroupEmoji,
      members: [{ initials: "JD", name: "Jordan (You)", role: "Admin" }],
      pending: [],
      color: GROUP_COLORS[groups.length % GROUP_COLORS.length],
      code: generateCode(),
    };
    setGroups(prev => [...prev, newGroup]);
    setSelectedGroup(newGroup);
    setShowCreateModal(false);
    setNewGroupName("");
    setNewGroupEmoji("👥");
    setCreateError("");
  };

  const handleInvite = () => {
    if (!inviteUsername.trim()) { setInviteError("Enter a username!"); return; }
    const username = inviteUsername.startsWith("@") ? inviteUsername : `@${inviteUsername}`;
    const initials = inviteUsername.replace("@", "").slice(0, 2).toUpperCase();
    const newPending = { initials, name: inviteUsername, username };
    setGroups(prev => prev.map(g => g.id === selectedGroup.id ? { ...g, pending: [...g.pending, newPending] } : g));
    setSelectedGroup(prev => ({ ...prev, pending: [...prev.pending, newPending] }));
    setInviteUsername("");
    setInviteSent(true);
    setTimeout(() => setInviteSent(false), 2000);
    setInviteError("");
  };

  const handleRemoveMember = (name) => {
    setGroups(prev => prev.map(g => g.id === selectedGroup.id ? { ...g, members: g.members.filter(m => m.name !== name) } : g));
    setSelectedGroup(prev => ({ ...prev, members: prev.members.filter(m => m.name !== name) }));
  };

  const handleCancelInvite = (username) => {
    setGroups(prev => prev.map(g => g.id === selectedGroup.id ? { ...g, pending: g.pending.filter(p => p.username !== username) } : g));
    setSelectedGroup(prev => ({ ...prev, pending: prev.pending.filter(p => p.username !== username) }));
  };

  const copyCode = () => {
    navigator.clipboard.writeText(selectedGroup.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`https://outsiders.app/join/${selectedGroup.code}`);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="root">

        {/* Top Nav */}
        <nav className="top-nav">
          <div style={{ padding: "0 24px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="logo-mark"><IconLogoMark /></div>
              <span className="bangers" style={{ fontSize: 26, color: "#1a1a2e" }}>Outsiders</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ position: "relative", cursor: "pointer" }}><IconBell /><div className="notif-dot" /></div>
              <div className="profile-chip">
                <div className="avatar" style={{ width: 30, height: 30, background: "#ff6b6b", fontSize: 12 }}>JD</div>
                <span style={{ fontWeight: 800, fontSize: 14 }}>Jordan</span>
              </div>
            </div>
          </div>
        </nav>

        <div className="layout">

          {/* Sidebar */}
          <aside className="sidebar">
            <p className="nav-section-label">Menu</p>
            {NAV_ITEMS.map((item) => (
              <div key={item.label} className={`nav-item ${activeNav === item.label ? "active" : ""}`} onClick={() => setActiveNav(item.label)}>
                {item.icon} {item.label}
              </div>
            ))}
          </aside>

          {/* Main */}
          <main className="main">

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <div>
                <h1 className="bangers" style={{ fontSize: 34, margin: "0 0 4px", color: "#1a1a2e" }}>My Crew 👥</h1>
                <p style={{ fontSize: 14, color: "#888", fontWeight: 700, margin: 0 }}>Manage your friend groups and invite your people.</p>
              </div>
              <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                <IconPlus /> New Group
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24 }}>

              {/* Group list */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <p className="bangers" style={{ fontSize: 14, color: "#aaa", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 4px" }}>Your Groups</p>
                {groups.map((g, i) => (
                  <div
                    key={g.id}
                    className="group-card"
                    style={{
                      background: selectedGroup?.id === g.id ? g.color.bg : "#fff",
                      borderColor: selectedGroup?.id === g.id ? g.color.border : "#1a1a2e",
                      boxShadow: `5px 5px 0 ${selectedGroup?.id === g.id ? g.color.border : "#1a1a2e"}`,
                    }}
                    onClick={() => { setSelectedGroup(g); setActiveTab("Members"); }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                      <div style={{ width: 44, height: 44, background: g.color.bg, border: `3px solid ${g.color.border}`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: `3px 3px 0 ${g.color.border}` }}>
                        {g.emoji}
                      </div>
                      <div>
                        <p className="bangers" style={{ fontSize: 17, margin: 0, color: "#1a1a2e" }}>{g.name}</p>
                        <p style={{ fontSize: 12, fontWeight: 700, color: "#888", margin: 0 }}>{g.members.length} members</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: -6 }}>
                      {g.members.slice(0, 4).map((m, j) => (
                        <div key={m.name} className="avatar-sm" style={{ background: AVATAR_COLORS[j], marginLeft: j > 0 ? -8 : 0, border: "2px solid #fff", zIndex: 4 - j }}>
                          {m.initials}
                        </div>
                      ))}
                      {g.pending.length > 0 && (
                        <span style={{ fontSize: 11, fontWeight: 800, color: "#ff9a3c", marginLeft: 10, alignSelf: "center" }}>
                          {g.pending.length} pending
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {/* Create new group prompt */}
                <div
                  onClick={() => setShowCreateModal(true)}
                  style={{ border: "3px dashed #ccc", borderRadius: 16, padding: "18px", textAlign: "center", cursor: "pointer", transition: "border-color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#ff6b6b"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#ccc"}
                >
                  <p className="bangers" style={{ fontSize: 16, color: "#aaa", margin: 0 }}>+ Create New Group</p>
                </div>
              </div>

              {/* Group detail */}
              {selectedGroup && (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                  {/* Group header card */}
                  <div className="card" style={{ background: selectedGroup.color.bg, borderColor: selectedGroup.color.border, boxShadow: `5px 5px 0 ${selectedGroup.color.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 56, height: 56, background: "#fff", border: `3px solid ${selectedGroup.color.border}`, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, boxShadow: `4px 4px 0 ${selectedGroup.color.border}` }}>
                          {selectedGroup.emoji}
                        </div>
                        <div>
                          <h2 className="bangers" style={{ fontSize: 26, margin: 0, color: "#1a1a2e" }}>{selectedGroup.name}</h2>
                          <p style={{ fontSize: 13, fontWeight: 700, color: "#666", margin: 0 }}>{selectedGroup.members.length} members · {selectedGroup.pending.length} pending</p>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 10 }}>
                        <button className="btn-secondary" onClick={() => setShowInviteModal(true)}>
                          <IconPlus /> Invite
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div style={{ display: "flex", gap: 8 }}>
                    {["Members", "Pending", "Invite Link"].map(t => (
                      <button key={t} className={`tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>
                        {t} {t === "Pending" && selectedGroup.pending.length > 0 && `(${selectedGroup.pending.length})`}
                      </button>
                    ))}
                  </div>

                  {/* Tab content */}
                  {activeTab === "Members" && (
                    <div className="card">
                      <div className="section-header">
                        <h3 className="bangers" style={{ fontSize: 20, margin: 0 }}>Members ({selectedGroup.members.length})</h3>
                      </div>
                      {selectedGroup.members.map((m, i) => (
                        <div key={m.name} className="member-row">
                          <div className="avatar" style={{ background: AVATAR_COLORS[i] }}>{m.initials}</div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 900, fontSize: 15, margin: 0 }}>{m.name}</p>
                          </div>
                          <span className="badge" style={{
                            background: m.role === "Admin" ? "#fff4e6" : "#e8f4fd",
                            color: m.role === "Admin" ? "#ff9a3c" : "#4ecdc4",
                            borderColor: m.role === "Admin" ? "#ff9a3c" : "#4ecdc4",
                          }}>{m.role}</span>
                          {m.role !== "Admin" && (
                            <button className="btn-danger" onClick={() => handleRemoveMember(m.name)}>Remove</button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "Pending" && (
                    <div className="card">
                      <div className="section-header">
                        <h3 className="bangers" style={{ fontSize: 20, margin: 0 }}>Pending Invites ({selectedGroup.pending.length})</h3>
                      </div>
                      {selectedGroup.pending.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "32px 0" }}>
                          <p style={{ fontSize: 32, margin: "0 0 8px" }}>🎉</p>
                          <p className="bangers" style={{ fontSize: 18, color: "#aaa", margin: 0 }}>No pending invites!</p>
                        </div>
                      ) : selectedGroup.pending.map((p) => (
                        <div key={p.username} className="pending-row">
                          <div className="avatar" style={{ background: "#ffd93d", color: "#1a1a2e" }}>{p.initials}</div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 900, fontSize: 15, margin: 0 }}>{p.username}</p>
                            <p style={{ fontSize: 12, fontWeight: 700, color: "#ff9a3c", margin: 0 }}>⏳ Invite pending</p>
                          </div>
                          <button className="btn-danger" onClick={() => handleCancelInvite(p.username)}>Cancel</button>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "Invite Link" && (
                    <div className="card">
                      <h3 className="bangers" style={{ fontSize: 20, margin: "0 0 20px" }}>Share Invite 🔗</h3>

                      {/* Code */}
                      <div style={{ marginBottom: 20 }}>
                        <p className="form-label">Group Code</p>
                        <div style={{ background: "#1a1a2e", color: "#ffd93d", border: "4px solid #1a1a2e", borderRadius: 12, padding: "16px", textAlign: "center", fontFamily: "'Bangers', cursive", fontSize: 40, letterSpacing: "0.3em", boxShadow: "5px 5px 0 #ff6b6b", marginBottom: 10 }}>
                          {selectedGroup.code}
                        </div>
                        <button className="btn-outline" style={{ width: "100%", justifyContent: "center" }} onClick={copyCode}>
                          {copied ? <><IconCheck /> Copied!</> : <><IconCopy /> Copy Code</>}
                        </button>
                      </div>

                      {/* Link */}
                      <div>
                        <p className="form-label">Invite Link</p>
                        <div className="link-box" style={{ marginBottom: 10 }}>
                          https://outsiders.app/join/{selectedGroup.code}
                        </div>
                        <button className="btn-outline" style={{ width: "100%", justifyContent: "center" }} onClick={copyLink}>
                          {linkCopied ? <><IconCheck /> Copied!</> : <><IconCopy /> Copy Link</>}
                        </button>
                      </div>

                      <div style={{ background: "#e8f4fd", border: "3px solid #4ecdc4", borderRadius: 12, padding: "14px 16px", marginTop: 20, boxShadow: "4px 4px 0 #4ecdc4" }}>
                        <p className="bangers" style={{ fontSize: 14, margin: "0 0 4px", letterSpacing: "0.04em" }}>How it works:</p>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#555", margin: 0 }}>Friends need an Outsiders account to join. Send them the code or link and they'll be in your group instantly.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>

        {/* ── Create Group Modal ── */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>✕</button>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <span className="comic-tag">New group! 🎉</span>
                <h2 className="bangers" style={{ fontSize: 32, margin: "8px 0 4px" }}>Create A Group</h2>
                <p style={{ fontSize: 14, color: "#888", fontWeight: 700, margin: 0 }}>Give your crew a name and pick an emoji.</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label className="form-label">Group Name</label>
                  <input className="form-input" type="text" placeholder="e.g. College Crew" value={newGroupName} onChange={e => { setNewGroupName(e.target.value); setCreateError(""); }} />
                  {createError && <p className="error-msg">{createError}</p>}
                </div>
                <div>
                  <label className="form-label">Pick An Emoji</label>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {["👥", "🎓", "💼", "🏖", "🎉", "🏠", "🎮", "🍕", "✈️", "🏋️"].map(e => (
                      <button
                        key={e}
                        onClick={() => setNewGroupEmoji(e)}
                        style={{
                          width: 44, height: 44, fontSize: 22, cursor: "pointer",
                          background: newGroupEmoji === e ? "#ffd93d" : "#fff",
                          border: `3px solid ${newGroupEmoji === e ? "#1a1a2e" : "#e0dbd0"}`,
                          borderRadius: 10,
                          boxShadow: newGroupEmoji === e ? "3px 3px 0 #1a1a2e" : "none",
                          transition: "all 0.15s",
                        }}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
                <button className="btn-primary" style={{ width: "100%", justifyContent: "center", fontSize: 20, padding: "14px", marginTop: 8 }} onClick={handleCreateGroup}>
                  Create Group 🚀
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Invite Modal ── */}
        {showInviteModal && (
          <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <button className="close-btn" onClick={() => setShowInviteModal(false)}>✕</button>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <span className="comic-tag">Grow the crew! 👥</span>
                <h2 className="bangers" style={{ fontSize: 32, margin: "8px 0 4px" }}>Invite Someone</h2>
                <p style={{ fontSize: 14, color: "#888", fontWeight: 700, margin: 0 }}>Enter their Outsiders username to send an invite.</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label className="form-label">Username</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontWeight: 900, color: "#aaa", fontSize: 16 }}>@</span>
                    <input className="form-input" type="text" placeholder="theirusername" value={inviteUsername} onChange={e => { setInviteUsername(e.target.value); setInviteError(""); setInviteSent(false); }} style={{ paddingLeft: 30 }} onKeyDown={e => e.key === "Enter" && handleInvite()} />
                  </div>
                  {inviteError && <p className="error-msg">{inviteError}</p>}
                  {inviteSent && <p style={{ fontFamily: "'Bangers', cursive", fontSize: 15, color: "#51cf66", marginTop: 6, letterSpacing: "0.04em" }}>✅ Invite sent!</p>}
                </div>
                <button className="btn-primary" style={{ width: "100%", justifyContent: "center", fontSize: 20, padding: "14px" }} onClick={handleInvite}>
                  Send Invite 📨
                </button>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 13, color: "#888", fontWeight: 700, margin: "0 0 8px" }}>Or share the group code:</p>
                  <div style={{ background: "#1a1a2e", color: "#ffd93d", borderRadius: 10, padding: "10px", fontFamily: "'Bangers', cursive", fontSize: 28, letterSpacing: "0.2em", boxShadow: "4px 4px 0 #ff6b6b" }}>
                    {selectedGroup.code}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
