import { useEffect, useState } from "react";
import { createOpenAIResponse, DEFAULT_OPENAI_MODEL } from "./openaiResponses";
import { buildGroupInviteLink } from "./siteConfig";
import { isSupabaseConfigured, supabase, supabaseConfigError } from "./supabase";

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

  .logo-link {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
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

  .crew-hero {
    background: #fff;
    border: 3px solid #1a1a2e;
    border-radius: 18px;
    box-shadow: 6px 6px 0 #1a1a2e;
    padding: 22px 24px;
    margin-bottom: 24px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 20px;
    align-items: center;
  }

  .crew-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(150px, 1fr));
    gap: 12px;
  }

  .action-tile {
    border: 3px solid #1a1a2e;
    border-radius: 16px;
    background: #fffdf9;
    box-shadow: 4px 4px 0 #1a1a2e;
    padding: 14px;
    cursor: pointer;
    text-align: left;
    transition: transform 0.12s, box-shadow 0.12s;
    min-height: 104px;
  }

  .action-tile:hover {
    transform: translate(-2px,-2px);
    box-shadow: 6px 6px 0 #1a1a2e;
  }

  .action-icon {
    width: 34px;
    height: 34px;
    border: 3px solid #1a1a2e;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 2px 2px 0 #1a1a2e;
    margin-bottom: 10px;
  }

  .crew-grid {
    display: grid;
    grid-template-columns: minmax(260px, 300px) minmax(0, 1fr);
    gap: 24px;
    align-items: start;
  }

  .group-list-panel {
    background: #fffdf9;
    border: 3px solid #1a1a2e;
    border-radius: 18px;
    box-shadow: 5px 5px 0 #1a1a2e;
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .empty-crew {
    border: 3px dashed #4ecdc4;
    border-radius: 16px;
    padding: 22px 18px;
    text-align: center;
    background: #e8f4fd;
  }

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

  @media (max-width: 980px) {
    .layout { display: block; }
    .sidebar {
      position: static;
      width: auto;
      height: auto;
      border-right: none;
      border-bottom: 4px solid #1a1a2e;
      flex-direction: row;
      overflow-x: auto;
    }
    .crew-hero { grid-template-columns: 1fr; }
    .crew-grid { grid-template-columns: 1fr; }
  }

  @media (max-width: 640px) {
    .main { padding: 22px 16px; }
    .crew-actions { grid-template-columns: 1fr; }
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

const INITIAL_GROUPS = [];

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

const NAV_TARGETS = {
  "Dashboard": "dashboard",
  "Hangouts": "create-hangout",
  "My Crew": "friend-groups",
  "Trips": "trip-planning",
  "Bill Split": "bill-split",
  "Ratings": "rate-outing",
  "Debrief": "debrief",
};

function getInitials(name) {
  const cleaned = (name || "").replace(/^@/, "").trim();
  if (!cleaned) return "YU";
  return cleaned.slice(0, 2).toUpperCase();
}

function normalizeMember(member, fallbackName = "You") {
  const name = member?.name || fallbackName;
  return {
    initials: member?.initials || getInitials(name),
    name,
    role: member?.role || "Member",
    username: member?.username || "",
    userId: member?.userId || null,
  };
}

function mapDbGroupToUi(row) {
  const colorIndex = Number.isInteger(row?.color_index) ? row.color_index : 0;
  return {
    id: row.id,
    name: row.name,
    emoji: row.emoji || "👥",
    members: Array.isArray(row.members) ? row.members.map((member) => normalizeMember(member)) : [],
    pending: Array.isArray(row.pending) ? row.pending : [],
    color: GROUP_COLORS[colorIndex % GROUP_COLORS.length],
    colorIndex,
    code: row.code,
    cases: Array.isArray(row.cases) ? row.cases : [],
    billWatch: row.bill_watch || null,
    peaceMaker: row.peace_maker || null,
    ownerId: row.owner_id || null,
    ownerUsername: row.owner_username || "",
  };
}

function mapUiGroupToDb(group) {
  return {
    name: group.name,
    emoji: group.emoji,
    members: group.members,
    pending: group.pending,
    color_index: group.colorIndex || 0,
    code: group.code,
    cases: group.cases || [],
    bill_watch: group.billWatch || null,
    peace_maker: group.peaceMaker || null,
    owner_id: group.ownerId || null,
    owner_username: group.ownerUsername || "",
  };
}

export default function OutsidersFriendGroups({ onNavigate, appData, setAppData, routeParams }) {
  const [groups, setGroups] = useState(appData?.groups?.length ? appData.groups : INITIAL_GROUPS);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [activeTab, setActiveTab] = useState("Members");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupEmoji, setNewGroupEmoji] = useState("👥");
  const [inviteUsername, setInviteUsername] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [inviteSent, setInviteSent] = useState(false);
  const [joinCode, setJoinCode] = useState(routeParams?.groupCode || "");
  const [joinError, setJoinError] = useState("");
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [createError, setCreateError] = useState("");
  const [activeNav, setActiveNav] = useState("My Crew");
  const [vibeProfiles, setVibeProfiles] = useState({});
  const [vibeLoading, setVibeLoading] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupsNotice, setGroupsNotice] = useState("");
  const handleNav = (label) => {
    setActiveNav(label);
    onNavigate?.(NAV_TARGETS[label] || "friend-groups");
  };

  useEffect(() => {
    setAppData?.((prev) => ({ ...prev, groups }));
  }, [groups, setAppData]);

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;

    let isActive = true;

    async function loadAuthState() {
      const { data } = await supabase.auth.getUser();
      if (!isActive) return;
      setCurrentUser(data.user || null);
    }

    loadAuthState();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
    });

    return () => {
      isActive = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !currentUser?.id) {
      setCurrentProfile(null);
      return;
    }

    let isActive = true;

    async function loadProfile() {
      const { data } = await supabase
        .from("profiles")
        .select("username, full_name")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (isActive) {
        setCurrentProfile(data || null);
      }
    }

    loadProfile();
    return () => {
      isActive = false;
    };
  }, [currentUser]);

  useEffect(() => {
    if (!isSupabaseConfigured || !currentUser?.id) return undefined;

    let isActive = true;

    async function loadGroups() {
      setGroupsLoading(true);
      const { data, error } = await supabase
        .from("groups")
        .select("*")
        .order("created_at", { ascending: false });

      if (!isActive) return;

      if (error) {
        setGroupsNotice(error.message);
        setGroupsLoading(false);
        return;
      }

      const nextGroups = (data || []).map(mapDbGroupToUi);
      setGroups(nextGroups);
      setGroupsLoading(false);
      setGroupsNotice("");
    }

    loadGroups();

    const channel = supabase
      .channel("outsiders-groups")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "groups" },
        () => {
          loadGroups();
        }
      )
      .subscribe();

    return () => {
      isActive = false;
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  useEffect(() => {
    const requestedCode = (routeParams?.groupCode || "").toUpperCase();
    if (requestedCode && selectedGroup?.code?.toUpperCase() !== requestedCode) {
      const matched = groups.find((group) => group.code?.toUpperCase() === requestedCode);
      if (matched) {
        setSelectedGroup(matched);
        setActiveTab("Invite Link");
      }
      return;
    }

    if (selectedGroup) {
      const refreshed = groups.find((group) => group.id === selectedGroup.id);
      setSelectedGroup(refreshed || null);
      return;
    }
  }, [groups, routeParams, selectedGroup]);

  useEffect(() => {
    if (routeParams?.groupCode) {
      setJoinCode(routeParams.groupCode);
    }
  }, [routeParams?.groupCode]);

  const currentDisplayName = currentProfile?.full_name || currentUser?.user_metadata?.full_name || "You";
  const currentUsername = currentProfile?.username || currentUser?.user_metadata?.username || "";
  const requestedGroupCode = (routeParams?.groupCode || "").trim().toUpperCase();
  const canManageSelectedGroup = Boolean(
    selectedGroup && (
      (currentUser?.id && selectedGroup.ownerId === currentUser.id) ||
      (!currentUser?.id && (!selectedGroup.ownerId || selectedGroup.ownerId === "local-user"))
    )
  );
  const isViewingInviteLink = Boolean(requestedGroupCode);
  const inviteLink = selectedGroup ? buildGroupInviteLink(selectedGroup.code) : "";
  const currentVoteKey = currentUser?.id || (currentUsername ? `username:${currentUsername}` : `name:${currentDisplayName}`);
  const selectedBillWatch = selectedGroup?.billWatch || { electedMemberName: "", votes: {}, checklist: [] };
  const billWatchVoteEntries = Object.entries(selectedBillWatch.votes || {});
  const billWatchLeader = selectedGroup?.members?.reduce((best, member) => {
    const memberVotes = billWatchVoteEntries.filter(([, chosenName]) => chosenName === member.name).length;
    if (!best || memberVotes > best.votes) {
      return { name: member.name, votes: memberVotes };
    }
    return best;
  }, null);

  async function persistGroup(nextGroup) {
    if (isSupabaseConfigured && currentUser?.id) {
      const { data, error } = await supabase
        .from("groups")
        .update(mapUiGroupToDb(nextGroup))
        .eq("id", nextGroup.id)
        .select("*")
        .single();

      if (error) {
        setGroupsNotice(error.message);
        return null;
      }

      const savedGroup = mapDbGroupToUi(data);
      setGroups((prev) => prev.map((group) => (group.id === savedGroup.id ? savedGroup : group)));
      setSelectedGroup(savedGroup);
      return savedGroup;
    }

    setGroups((prev) => prev.map((group) => (group.id === nextGroup.id ? nextGroup : group)));
    setSelectedGroup(nextGroup);
    return nextGroup;
  }

  async function generateVibeProfile(group) {
    const apiKey = localStorage.getItem("outsiders-ai-api-key") || import.meta.env.VITE_OPENAI_API_KEY || "";
    if (!apiKey) {
      setVibeProfiles(prev => ({ ...prev, [group.id]: { error: "Open the AI panel (bottom right) to set up your API key first." } }));
      return;
    }
    setVibeLoading(group.id);
    const memberList = group.members.map(m => m.name).join(", ");
    const prompt = `Generate a fun vibe profile for a friend group called "${group.name}" with ${group.members.length} members (${memberList}). Include:\n1. A one-line vibe summary (e.g. "60% chaos, 40% snacks")\n2. Three personality trait labels (short, funny, like "Late arrivals", "Idea starters")\n3. Their ideal hangout type (1 sentence)\n4. A short group motto\n\nRespond ONLY with JSON: {"vibe": "...", "traits": ["...", "...", "..."], "idealHangout": "...", "motto": "..."}`;
    try {
      const result = await createOpenAIResponse({
        apiKey,
        model: DEFAULT_OPENAI_MODEL,
        instructions: "You generate fun, playful group personality profiles for friend groups. Always respond with valid JSON only, no markdown.",
        input: [{ role: "user", content: [{ type: "input_text", text: prompt }] }],
      });
      let parsed = null;
      try {
        const match = result.text.match(/\{[\s\S]*\}/);
        if (match) parsed = JSON.parse(match[0]);
      } catch {
        parsed = null;
      }
      setVibeProfiles(prev => ({ ...prev, [group.id]: parsed || { raw: result.text } }));
    } catch (err) {
      setVibeProfiles(prev => ({ ...prev, [group.id]: { error: err.message || "Something went wrong." } }));
    } finally {
      setVibeLoading(null);
    }
  }

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) { setCreateError("Give your group a name!"); return; }
    if (isSupabaseConfigured && !currentUser?.id) {
      setCreateError(`Log in first to create a shared group. ${supabaseConfigError}`);
      return;
    }
    const newGroup = {
      id: Date.now(),
      name: newGroupName.trim(),
      emoji: newGroupEmoji,
      members: [{
        initials: getInitials(currentDisplayName),
        name: currentDisplayName,
        role: "Admin",
        username: currentUsername ? `@${currentUsername}` : "",
        userId: currentUser?.id || "local-user",
      }],
      pending: [],
      color: GROUP_COLORS[groups.length % GROUP_COLORS.length],
      colorIndex: groups.length % GROUP_COLORS.length,
      code: generateCode(),
      cases: [],
      billWatch: {
        electedMemberName: "",
        votes: {},
        checklist: [
          "Track what each person paid",
          "Check every split before people settle up",
          "Post the final math after each hangout",
        ],
      },
      peaceMaker: {
        electedMemberName: "",
        votes: {},
        oath: "Hear both sides, cool the temperature, and push the room toward something fair.",
      },
      ownerId: currentUser?.id || "local-user",
      ownerUsername: currentUsername,
    };

    if (isSupabaseConfigured && currentUser?.id) {
      const { data, error } = await supabase
        .from("groups")
        .insert(mapUiGroupToDb(newGroup))
        .select("*")
        .single();

      if (error) {
        setCreateError(error.message);
        return;
      }

      const savedGroup = mapDbGroupToUi(data);
      setGroups((prev) => [savedGroup, ...prev]);
      setSelectedGroup(savedGroup);
    } else {
      setGroups(prev => [...prev, newGroup]);
      setSelectedGroup(newGroup);
    }
    setShowCreateModal(false);
    setNewGroupName("");
    setNewGroupEmoji("👥");
    setCreateError("");
  };

  const handleInvite = async () => {
    if (!inviteUsername.trim()) { setInviteError("Enter a username!"); return; }
    if (!selectedGroup) return;
    const username = inviteUsername.startsWith("@") ? inviteUsername : `@${inviteUsername}`;
    const initials = getInitials(inviteUsername);
    const newPending = { initials, name: inviteUsername, username };
    const nextGroup = { ...selectedGroup, pending: [...selectedGroup.pending, newPending] };

    if (isSupabaseConfigured && currentUser?.id) {
      const { data, error } = await supabase
        .from("groups")
        .update(mapUiGroupToDb(nextGroup))
        .eq("id", selectedGroup.id)
        .select("*")
        .single();

      if (error) {
        setInviteError(error.message);
        return;
      }

      const savedGroup = mapDbGroupToUi(data);
      setGroups((prev) => prev.map((group) => (group.id === savedGroup.id ? savedGroup : group)));
      setSelectedGroup(savedGroup);
    } else {
      setGroups(prev => prev.map(g => g.id === selectedGroup.id ? { ...g, pending: [...g.pending, newPending] } : g));
      setSelectedGroup(prev => ({ ...prev, pending: [...prev.pending, newPending] }));
    }
    setInviteUsername("");
    setInviteSent(true);
    setTimeout(() => setInviteSent(false), 2000);
    setInviteError("");
  };

  const handleRemoveMember = async (name) => {
    if (!selectedGroup) return;
    const nextGroup = { ...selectedGroup, members: selectedGroup.members.filter((member) => member.name !== name) };

    if (isSupabaseConfigured && currentUser?.id) {
      const { data } = await supabase
        .from("groups")
        .update(mapUiGroupToDb(nextGroup))
        .eq("id", selectedGroup.id)
        .select("*")
        .single();

      if (data) {
        const savedGroup = mapDbGroupToUi(data);
        setGroups((prev) => prev.map((group) => (group.id === savedGroup.id ? savedGroup : group)));
        setSelectedGroup(savedGroup);
      }
      return;
    }

    setGroups(prev => prev.map(g => g.id === selectedGroup.id ? { ...g, members: g.members.filter(m => m.name !== name) } : g));
    setSelectedGroup(prev => ({ ...prev, members: prev.members.filter(m => m.name !== name) }));
  };

  const handleCancelInvite = async (username) => {
    if (!selectedGroup) return;
    const nextGroup = { ...selectedGroup, pending: selectedGroup.pending.filter((pendingInvite) => pendingInvite.username !== username) };

    if (isSupabaseConfigured && currentUser?.id) {
      const { data } = await supabase
        .from("groups")
        .update(mapUiGroupToDb(nextGroup))
        .eq("id", selectedGroup.id)
        .select("*")
        .single();

      if (data) {
        const savedGroup = mapDbGroupToUi(data);
        setGroups((prev) => prev.map((group) => (group.id === savedGroup.id ? savedGroup : group)));
        setSelectedGroup(savedGroup);
      }
      return;
    }

    setGroups(prev => prev.map(g => g.id === selectedGroup.id ? { ...g, pending: g.pending.filter(p => p.username !== username) } : g));
    setSelectedGroup(prev => ({ ...prev, pending: prev.pending.filter(p => p.username !== username) }));
  };

  const handleBillWatchVote = async (memberName) => {
    if (!selectedGroup) return;
    const nextGroup = {
      ...selectedGroup,
      billWatch: {
        ...selectedBillWatch,
        electedMemberName: memberName,
        votes: {
          ...(selectedBillWatch.votes || {}),
          [currentVoteKey]: memberName,
        },
      },
    };

    const savedGroup = await persistGroup(nextGroup);
    if (!savedGroup) return;
    setGroupsNotice(`${memberName} just got your Bill Watch vote.`);
  };

  const handleDeleteGroup = async () => {
    if (!selectedGroup || !canManageSelectedGroup) return;
    const confirmed = window.confirm(`Delete "${selectedGroup.name}"? This can't be undone.`);
    if (!confirmed) return;

    if (isSupabaseConfigured && currentUser?.id) {
      const { error } = await supabase.from("groups").delete().eq("id", selectedGroup.id);
      if (error) {
        setGroupsNotice(error.message);
        return;
      }
    }

    setGroups((prev) => prev.filter((group) => group.id !== selectedGroup.id));
    setSelectedGroup(null);
    setActiveTab("Members");
  };

  const joinSelectedGroup = async (groupToJoin) => {
    if (!groupToJoin) return false;
    if (isSupabaseConfigured && !currentUser?.id) {
      onNavigate?.("login", { redirect: "friend-groups", groupCode: groupToJoin.code });
      return false;
    }

    const alreadyMember = groupToJoin.members.some(
      (member) => member.userId === currentUser?.id || member.username === (currentUsername ? `@${currentUsername}` : "")
    );

    if (alreadyMember) {
      setGroupsNotice("You're already in this crew.");
      setSelectedGroup(groupToJoin);
      setActiveTab("Members");
      return true;
    }

    const joiningMember = normalizeMember({
      name: currentDisplayName,
      initials: getInitials(currentDisplayName),
      role: "Member",
      username: currentUsername ? `@${currentUsername}` : "",
      userId: currentUser?.id || "local-user",
    }, currentDisplayName);

    const nextGroup = {
      ...groupToJoin,
      members: [...groupToJoin.members, joiningMember],
      pending: groupToJoin.pending.filter((pendingInvite) => pendingInvite.username !== `@${currentUsername}`),
    };

    if (isSupabaseConfigured && currentUser?.id) {
      const { data, error } = await supabase
        .from("groups")
        .update(mapUiGroupToDb(nextGroup))
        .eq("id", groupToJoin.id)
        .select("*")
        .single();

      if (error) {
        setGroupsNotice(error.message);
        return false;
      }

      const savedGroup = mapDbGroupToUi(data);
      setGroups((prev) => prev.map((group) => (group.id === savedGroup.id ? savedGroup : group)));
      setSelectedGroup(savedGroup);
    } else {
      setGroups((prev) => prev.map((group) => (group.id === groupToJoin.id ? nextGroup : group)));
      setSelectedGroup(nextGroup);
    }

    setGroupsNotice(`You're now in ${groupToJoin.name}.`);
    setActiveTab("Members");
    return true;
  };

  const handleJoinFromInviteLink = async () => {
    if (!selectedGroup) {
      if (isSupabaseConfigured && !currentUser?.id) {
        onNavigate?.("login", { redirect: "friend-groups", groupCode: requestedGroupCode });
        return;
      }
      setGroupsNotice("That crew invite could not be found.");
      return;
    }
    await joinSelectedGroup(selectedGroup);
  };

  const handleJoinByCode = async () => {
    const normalizedCode = joinCode.trim().toUpperCase();
    if (!normalizedCode) {
      setJoinError("Enter a crew code.");
      return;
    }

    const matchedGroup = groups.find((group) => group.code?.toUpperCase() === normalizedCode);
    if (!matchedGroup) {
      setJoinError(groupsLoading ? "Crews are still loading. Try again in a second." : "No crew found with that code.");
      return;
    }

    setJoinError("");
    const joined = await joinSelectedGroup(matchedGroup);
    if (joined) {
      setShowJoinModal(false);
      setJoinCode("");
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(selectedGroup.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
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
              <div style={{ position: "relative", cursor: "pointer" }} onClick={() => onNavigate?.("profile")}><IconBell /><div className="notif-dot" /></div>
              <div className="profile-chip" onClick={() => onNavigate?.("profile")}>
                <div className="avatar" style={{ width: 30, height: 30, background: "#ff6b6b", fontSize: 11 }}>YOU</div>
                <span style={{ fontWeight: 800, fontSize: 14 }}>You</span>
              </div>
            </div>
          </div>
        </nav>

        <div className="layout">

          {/* Sidebar */}
          <aside className="sidebar">
            <p className="nav-section-label">Menu</p>
            {NAV_ITEMS.map((item) => (
              <div key={item.label} className={`nav-item ${activeNav === item.label ? "active" : ""}`} onClick={() => handleNav(item.label)}>
                {item.icon} {item.label}
              </div>
            ))}
          </aside>

          {/* Main */}
          <main className="main">

            {/* Header */}
            <div className="crew-hero">
              <div>
                <span className="comic-tag">Crew HQ</span>
                <h1 className="bangers" style={{ fontSize: 38, margin: "0 0 6px", color: "#1a1a2e" }}>My Crew</h1>
                <p style={{ fontSize: 14, color: "#666", fontWeight: 800, margin: "0 0 14px", maxWidth: 560 }}>Create a group, join one from an invite code, and keep the roster, links, votes, and planning details in one place.</p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <span className="badge" style={{ background: "#e8f4fd", color: "#4ecdc4", borderColor: "#4ecdc4" }}>{groups.length} group{groups.length === 1 ? "" : "s"}</span>
                  <span className="badge" style={{ background: "#fff4e6", color: "#ff9a3c", borderColor: "#ff9a3c" }}>
                    {groups.reduce((count, group) => count + group.members.length, 0)} total member{groups.reduce((count, group) => count + group.members.length, 0) === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
              <div className="crew-actions">
                <button className="action-tile" onClick={() => { setJoinCode(routeParams?.groupCode || ""); setJoinError(""); setShowJoinModal(true); }}>
                  <span className="action-icon" style={{ background: "#ffd93d" }}><IconUsers /></span>
                  <span className="bangers" style={{ display: "block", fontSize: 19, color: "#1a1a2e", marginBottom: 4 }}>Join Crew</span>
                  <span style={{ display: "block", fontSize: 12, fontWeight: 800, color: "#666" }}>Use an invite code or link.</span>
                </button>
                <button className="action-tile" onClick={() => setShowCreateModal(true)}>
                  <span className="action-icon" style={{ background: "#ff6b6b", color: "#fff" }}><IconPlus /></span>
                  <span className="bangers" style={{ display: "block", fontSize: 19, color: "#1a1a2e", marginBottom: 4 }}>Create Group</span>
                  <span style={{ display: "block", fontSize: 12, fontWeight: 800, color: "#666" }}>Start a new crew space.</span>
                </button>
              </div>
            </div>

            {groupsNotice && (
              <div style={{ background: "#fff4e6", border: "3px solid #ff9a3c", borderRadius: 12, padding: "12px 16px", boxShadow: "4px 4px 0 #ff9a3c", marginBottom: 18 }}>
                <p style={{ fontSize: 13, fontWeight: 800, color: "#7a4d00", margin: 0 }}>{groupsNotice}</p>
              </div>
            )}

            {isViewingInviteLink && !selectedGroup && (
              <div style={{ background: "#fff", border: "3px solid #4ecdc4", borderRadius: 16, padding: "18px 20px", boxShadow: "5px 5px 0 #4ecdc4", marginBottom: 18 }}>
                <p className="bangers" style={{ fontSize: 20, margin: "0 0 6px", color: "#1a1a2e" }}>Crew Invite Ready</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#555", margin: "0 0 14px" }}>
                  This invite code is {requestedGroupCode}. Log in or sign up, then you can join the crew from this same link.
                </p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button className="btn-primary" onClick={() => onNavigate?.("login", { redirect: "friend-groups", groupCode: requestedGroupCode })}>
                    Log In To Join
                  </button>
                  <button className="btn-outline" onClick={() => onNavigate?.("signup", { redirect: "friend-groups", groupCode: requestedGroupCode })}>
                    Sign Up
                  </button>
                </div>
              </div>
            )}

            <div className="crew-grid">

              {/* Group list */}
              <div className="group-list-panel">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                  <p className="bangers" style={{ fontSize: 14, color: "#888", letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>Your Groups</p>
                  <button className="btn-outline" style={{ padding: "7px 10px", fontSize: 13 }} onClick={() => { setJoinCode(routeParams?.groupCode || ""); setJoinError(""); setShowJoinModal(true); }}>
                    Join
                  </button>
                </div>
                {groups.length === 0 && (
                  <div className="empty-crew">
                    <p style={{ fontSize: 30, margin: "0 0 8px" }}>👥</p>
                    <p className="bangers" style={{ fontSize: 20, color: "#1a1a2e", margin: "0 0 6px" }}>No crews yet</p>
                    <p style={{ fontSize: 13, fontWeight: 800, color: "#555", margin: "0 0 14px" }}>Create a group or join one with an invite code.</p>
                    <div style={{ display: "grid", gap: 10 }}>
                      <button className="btn-secondary" style={{ justifyContent: "center" }} onClick={() => { setJoinCode(routeParams?.groupCode || ""); setJoinError(""); setShowJoinModal(true); }}>
                        <IconUsers /> Join Crew
                      </button>
                      <button className="btn-primary" style={{ justifyContent: "center" }} onClick={() => setShowCreateModal(true)}>
                        <IconPlus /> Create New Group
                      </button>
                    </div>
                  </div>
                )}
                {groupsLoading && (
                  <div style={{ border: "3px dashed #4ecdc4", borderRadius: 16, padding: "18px", textAlign: "center", background: "#e8f4fd" }}>
                    <p className="bangers" style={{ fontSize: 16, color: "#1a1a2e", margin: "0 0 6px" }}>Loading your shared crews...</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#666", margin: 0 }}>Pulling the latest groups from Supabase.</p>
                  </div>
                )}
                {groups.map((g) => (
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

                {groups.length > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <button className="btn-secondary" style={{ justifyContent: "center", padding: "10px 12px" }} onClick={() => { setJoinCode(routeParams?.groupCode || ""); setJoinError(""); setShowJoinModal(true); }}>
                      <IconUsers /> Join
                    </button>
                    <button className="btn-primary" style={{ justifyContent: "center", padding: "10px 12px" }} onClick={() => setShowCreateModal(true)}>
                      <IconPlus /> New
                    </button>
                  </div>
                )}
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
                          <p style={{ fontSize: 13, fontWeight: 700, color: "#666", margin: 0 }}>
                            {selectedGroup.members.length} members · {selectedGroup.pending.length} pending
                            {selectedGroup.ownerUsername ? ` · Created by @${selectedGroup.ownerUsername}` : ""}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 10 }}>
                        <button className="btn-secondary" onClick={() => setShowInviteModal(true)}>
                          <IconPlus /> Invite
                        </button>
                        {canManageSelectedGroup && (
                          <button className="btn-danger" onClick={handleDeleteGroup}>
                            Delete Group
                          </button>
                        )}
                      </div>
                    </div>
                    {isViewingInviteLink && routeParams?.groupCode?.toUpperCase() === selectedGroup.code?.toUpperCase() && (
                      <div style={{ marginTop: 14, background: "#fff", border: `3px solid ${selectedGroup.color.border}`, borderRadius: 12, padding: "14px 16px", boxShadow: `4px 4px 0 ${selectedGroup.color.border}` }}>
                        <p className="bangers" style={{ fontSize: 15, margin: "0 0 6px", color: "#1a1a2e" }}>Invite Link Opened</p>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#555", margin: "0 0 12px" }}>
                          This link points to {selectedGroup.name}. Log in, then tap below to join this crew.
                        </p>
                        <button className="btn-primary" style={{ width: "auto" }} onClick={handleJoinFromInviteLink}>
                          Join This Crew
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Tabs */}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {["Members", "Pending", "Invite Link", "Bill Watch", "Vibe Profile"].map(t => (
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
                          {canManageSelectedGroup && m.role !== "Admin" && (
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
                          {canManageSelectedGroup ? <button className="btn-danger" onClick={() => handleCancelInvite(p.username)}>Cancel</button> : null}
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "Bill Watch" && (
                    <div className="card">
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
                        <div>
                          <h3 className="bangers" style={{ fontSize: 20, margin: "0 0 4px" }}>Bill Watch Roster 🧮</h3>
                          <p style={{ fontSize: 13, fontWeight: 700, color: "#888", margin: 0 }}>Vote for the most observant and trustworthy person to track every hangout split.</p>
                        </div>
                        <span className="badge" style={{ background: "#e8f4fd", color: "#4ecdc4", borderColor: "#4ecdc4" }}>
                          {billWatchLeader?.name ? `${billWatchLeader.name} leading` : "No votes yet"}
                        </span>
                      </div>

                      <div style={{ background: "#fff4e6", border: "3px solid #ff9a3c", borderRadius: 12, padding: "14px 16px", boxShadow: "3px 3px 0 #ff9a3c", marginBottom: 18 }}>
                        <p className="bangers" style={{ fontSize: 14, margin: "0 0 8px" }}>Money job checklist</p>
                        {(selectedBillWatch.checklist || []).map((item) => (
                          <p key={item} style={{ fontSize: 13, fontWeight: 700, color: "#555", margin: "0 0 6px" }}>• {item}</p>
                        ))}
                      </div>

                      <div style={{ display: "grid", gap: 12 }}>
                        {selectedGroup.members.map((member, index) => {
                          const voteCount = billWatchVoteEntries.filter(([, chosenName]) => chosenName === member.name).length;
                          const isMyVote = selectedBillWatch.votes?.[currentVoteKey] === member.name;
                          const isLeader = billWatchLeader?.name === member.name && voteCount > 0;
                          return (
                            <div key={member.name} style={{ border: "3px solid #1a1a2e", borderRadius: 14, padding: "14px 16px", boxShadow: "4px 4px 0 #1a1a2e", background: isLeader ? "#e8fde8" : "#fff" }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                  <div className="avatar" style={{ background: AVATAR_COLORS[index % AVATAR_COLORS.length] }}>{member.initials}</div>
                                  <div>
                                    <p style={{ fontWeight: 900, fontSize: 15, margin: 0 }}>{member.name}</p>
                                    <p style={{ fontSize: 12, fontWeight: 700, color: "#888", margin: 0 }}>
                                      {voteCount} crew vote{voteCount === 1 ? "" : "s"} {isMyVote ? "· You picked them" : ""}
                                    </p>
                                  </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  {isLeader ? <span className="badge" style={{ background: "#e8fde8", color: "#51cf66", borderColor: "#51cf66" }}>Top Pick</span> : null}
                                  <button className="btn-secondary" style={{ fontSize: 14, padding: "8px 14px" }} onClick={() => handleBillWatchVote(member.name)}>
                                    {isMyVote ? "Change Vote" : "Vote For This Person"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {selectedBillWatch.electedMemberName ? (
                        <div style={{ background: "#e8f4fd", border: "3px solid #4ecdc4", borderRadius: 12, padding: "14px 16px", boxShadow: "3px 3px 0 #4ecdc4", marginTop: 18 }}>
                          <p className="bangers" style={{ fontSize: 14, margin: "0 0 6px" }}>Current designated tracker</p>
                          <p style={{ fontSize: 15, fontWeight: 900, color: "#1a1a2e", margin: 0 }}>{selectedBillWatch.electedMemberName}</p>
                        </div>
                      ) : null}
                    </div>
                  )}

                  {activeTab === "Vibe Profile" && (
                    <div className="card">
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                        <h3 className="bangers" style={{ fontSize: 20, margin: 0 }}>Vibe Profile ✨</h3>
                        <button
                          className="btn-secondary"
                          onClick={() => generateVibeProfile(selectedGroup)}
                          disabled={vibeLoading === selectedGroup.id}
                          style={{ fontSize: 14, padding: "8px 14px" }}
                        >
                          {vibeLoading === selectedGroup.id ? "Generating..." : vibeProfiles[selectedGroup.id] ? "Regenerate" : "Generate"}
                        </button>
                      </div>

                      {!vibeProfiles[selectedGroup.id] ? (
                        <div style={{ textAlign: "center", padding: "32px 0" }}>
                          <p style={{ fontSize: 36, margin: "0 0 8px" }}>🔮</p>
                          <p className="bangers" style={{ fontSize: 18, color: "#aaa", margin: "0 0 6px" }}>No vibe profile yet!</p>
                          <p style={{ fontSize: 13, fontWeight: 700, color: "#888", margin: 0 }}>Hit Generate to reveal your group's personality.</p>
                        </div>
                      ) : vibeProfiles[selectedGroup.id].error ? (
                        <p style={{ color: "#ff6b6b", fontWeight: 900, fontSize: 14 }}>{vibeProfiles[selectedGroup.id].error}</p>
                      ) : vibeProfiles[selectedGroup.id].raw ? (
                        <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{vibeProfiles[selectedGroup.id].raw}</div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                          <div style={{ background: selectedGroup.color.bg, border: `3px solid ${selectedGroup.color.border}`, borderRadius: 12, padding: "16px 18px", boxShadow: `4px 4px 0 ${selectedGroup.color.border}` }}>
                            <p className="bangers" style={{ fontSize: 12, letterSpacing: "0.08em", color: "#888", margin: "0 0 6px", textTransform: "uppercase" }}>Group Vibe</p>
                            <p className="bangers" style={{ fontSize: 22, margin: 0, color: "#1a1a2e" }}>{vibeProfiles[selectedGroup.id].vibe}</p>
                          </div>

                          {vibeProfiles[selectedGroup.id].traits?.length > 0 && (
                            <div>
                              <p className="bangers" style={{ fontSize: 12, letterSpacing: "0.08em", color: "#888", margin: "0 0 10px", textTransform: "uppercase" }}>Personality Traits</p>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                {vibeProfiles[selectedGroup.id].traits.map((trait, i) => (
                                  <span key={i} className="badge" style={{ background: "#fff4e6", color: "#ff9a3c", borderColor: "#ff9a3c", padding: "5px 12px", fontSize: 13 }}>{trait}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          {vibeProfiles[selectedGroup.id].idealHangout && (
                            <div style={{ background: "#e8f4fd", border: "3px solid #4ecdc4", borderRadius: 12, padding: "14px 16px", boxShadow: "3px 3px 0 #4ecdc4" }}>
                              <p className="bangers" style={{ fontSize: 12, letterSpacing: "0.08em", color: "#888", margin: "0 0 6px", textTransform: "uppercase" }}>Ideal Hangout</p>
                              <p style={{ fontSize: 14, fontWeight: 700, margin: 0, color: "#1a1a2e" }}>{vibeProfiles[selectedGroup.id].idealHangout}</p>
                            </div>
                          )}

                          {vibeProfiles[selectedGroup.id].motto && (
                            <div style={{ background: "#fde8f0", border: "3px solid #ff6b9d", borderRadius: 12, padding: "14px 16px", boxShadow: "3px 3px 0 #ff6b9d", textAlign: "center" }}>
                              <p className="bangers" style={{ fontSize: 12, letterSpacing: "0.08em", color: "#888", margin: "0 0 6px", textTransform: "uppercase" }}>Group Motto</p>
                              <p className="bangers" style={{ fontSize: 20, margin: 0, color: "#ff6b9d" }}>"{vibeProfiles[selectedGroup.id].motto}"</p>
                            </div>
                          )}
                        </div>
                      )}
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
                          {inviteLink}
                        </div>
                        <button className="btn-outline" style={{ width: "100%", justifyContent: "center" }} onClick={copyLink}>
                          {linkCopied ? <><IconCheck /> Copied!</> : <><IconCopy /> Copy Link</>}
                        </button>
                      </div>

                      <div style={{ background: "#e8f4fd", border: "3px solid #4ecdc4", borderRadius: 12, padding: "14px 16px", marginTop: 20, boxShadow: "4px 4px 0 #4ecdc4" }}>
                        <p className="bangers" style={{ fontSize: 14, margin: "0 0 4px", letterSpacing: "0.04em" }}>How it works:</p>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#555", margin: 0 }}>Send the code or this link. When your friend logs in on Outsiders, the link opens this crew and lets them join it.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {!selectedGroup && (
                <div className="card" style={{ minHeight: 360, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", background: "#fffdf9" }}>
                  <div style={{ maxWidth: 420 }}>
                    <div style={{ width: 70, height: 70, border: "3px solid #1a1a2e", borderRadius: 18, boxShadow: "4px 4px 0 #1a1a2e", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", background: "#ffd93d", fontSize: 32 }}>
                      👥
                    </div>
                    <p className="bangers" style={{ fontSize: 26, margin: "0 0 8px", color: "#1a1a2e" }}>Pick Or Join A Crew</p>
                    <p style={{ fontSize: 14, fontWeight: 800, color: "#666", margin: "0 0 18px" }}>Select a group from the left, paste an invite code, or create a new group for your people.</p>
                    <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
                      <button className="btn-secondary" onClick={() => { setJoinCode(routeParams?.groupCode || ""); setJoinError(""); setShowJoinModal(true); }}>
                        <IconUsers /> Join Crew
                      </button>
                      <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                        <IconPlus /> Create Group
                      </button>
                    </div>
                  </div>
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

        {/* ── Join Crew Modal ── */}
        {showJoinModal && (
          <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <button className="close-btn" onClick={() => setShowJoinModal(false)}>✕</button>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <span className="comic-tag">Got a code?</span>
                <h2 className="bangers" style={{ fontSize: 32, margin: "8px 0 4px" }}>Join A Crew</h2>
                <p style={{ fontSize: 14, color: "#888", fontWeight: 700, margin: 0 }}>Paste the crew code from your invitation.</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label className="form-label">Crew Code</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="ABC123"
                    value={joinCode}
                    onChange={e => { setJoinCode(e.target.value.toUpperCase()); setJoinError(""); }}
                    onKeyDown={e => e.key === "Enter" && handleJoinByCode()}
                    style={{ textTransform: "uppercase", letterSpacing: "0.16em", textAlign: "center" }}
                  />
                  {joinError && <p className="error-msg">{joinError}</p>}
                </div>
                {isSupabaseConfigured && !currentUser?.id ? (
                  <button className="btn-primary" style={{ width: "100%", justifyContent: "center", fontSize: 20, padding: "14px" }} onClick={() => onNavigate?.("login", { redirect: "friend-groups", groupCode: joinCode.trim().toUpperCase() })}>
                    Log In To Join
                  </button>
                ) : (
                  <button className="btn-primary" style={{ width: "100%", justifyContent: "center", fontSize: 20, padding: "14px" }} onClick={handleJoinByCode}>
                    Join Crew
                  </button>
                )}
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
                  <div className="link-box" style={{ marginTop: 12 }}>{inviteLink}</div>
                  <button className="btn-outline" style={{ width: "100%", justifyContent: "center", marginTop: 12 }} onClick={copyLink}>
                    {linkCopied ? <><IconCheck /> Copied Link!</> : <><IconCopy /> Copy Invite Link</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
