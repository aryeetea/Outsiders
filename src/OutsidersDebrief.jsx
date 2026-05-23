import { useEffect, useMemo, useState } from "react";
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
  .form-input { width: 100%; padding: 12px 14px; font-size: 14px; font-family: 'Nunito', sans-serif; font-weight: 700; color: #1a1a2e; background: #fffdf9; border: 3px solid #1a1a2e; border-radius: 10px; outline: none; transition: box-shadow 0.15s, border-color 0.15s; box-shadow: 3px 3px 0 #1a1a2e; resize: none; }
  .form-input:focus { border-color: #ff6b9d; box-shadow: 3px 3px 0 #ff6b9d; }
  .form-input::placeholder { color: #bbb; font-weight: 600; }
  .form-label { display: block; font-family: 'Bangers', cursive; font-size: 15px; letter-spacing: 0.05em; color: #1a1a2e; margin-bottom: 6px; }
  .avatar { width: 38px; height: 38px; border-radius: 50%; border: 2.5px solid #1a1a2e; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 13px; color: #fff; flex-shrink: 0; box-shadow: 2px 2px 0 #1a1a2e; }
  .badge { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 8px; font-family: 'Bangers', cursive; font-size: 12px; letter-spacing: 0.05em; border: 2px solid; }
  .case-card { background: #fff; border: 3px solid #1a1a2e; border-radius: 14px; padding: 18px 20px; box-shadow: 5px 5px 0 #1a1a2e; cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; }
  .case-card:hover { transform: translate(-2px,-2px); box-shadow: 7px 7px 0 #1a1a2e; }
  .case-note { border: 3px solid #1a1a2e; border-radius: 14px; padding: 14px 16px; box-shadow: 4px 4px 0 #1a1a2e; }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 24px; }
  .modal { background: #fff; border: 4px solid #1a1a2e; border-radius: 20px; box-shadow: 10px 10px 0 #1a1a2e; padding: 36px 32px; width: 100%; max-width: 560px; position: relative; max-height: 90vh; overflow-y: auto; }
  .close-btn { position: absolute; top: 16px; right: 16px; background: #f5f3ee; border: 2px solid #1a1a2e; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 16px; box-shadow: 2px 2px 0 #1a1a2e; }
  .profile-chip { display: flex; align-items: center; gap: 8px; background: #fff; border: 3px solid #1a1a2e; border-radius: 50px; padding: 4px 14px 4px 4px; box-shadow: 3px 3px 0 #1a1a2e; cursor: pointer; }
  .notif-dot { width: 8px; height: 8px; background: #ff6b6b; border: 2px solid #1a1a2e; border-radius: 50%; position: absolute; top: -2px; right: -2px; }
  .comic-tag { display: inline-block; background: #ffd93d; border: 2px solid #1a1a2e; border-radius: 6px; padding: 1px 10px; font-family: 'Bangers', cursive; font-size: 12px; letter-spacing: 0.06em; box-shadow: 2px 2px 0 #1a1a2e; transform: rotate(-2deg); }
`;

const NAV_ITEMS = [
  { icon: "🏠", label: "Dashboard" },
  { icon: "🗓", label: "Hangouts" },
  { icon: "👥", label: "My Crew" },
  { icon: "✈️", label: "Trips" },
  { icon: "💸", label: "Bill Split" },
  { icon: "⭐", label: "Ratings" },
  { icon: "❤️", label: "Debrief" },
];

const NAV_TARGETS = {
  Dashboard: "dashboard",
  Hangouts: "create-hangout",
  "My Crew": "friend-groups",
  Trips: "trip-planning",
  "Bill Split": "bill-split",
  Ratings: "rate-outing",
  Debrief: "debrief",
};

function getInitials(name) {
  const cleaned = (name || "").replace(/^@/, "").trim();
  if (!cleaned) return "??";
  return cleaned.slice(0, 2).toUpperCase();
}

function getNextId(items, prefix) {
  const nextNumber = (items || []).reduce((highest, item) => {
    const numeric = Number(String(item.id || "").replace(`${prefix}-`, ""));
    return Number.isFinite(numeric) ? Math.max(highest, numeric) : highest;
  }, 0) + 1;

  return `${prefix}-${nextNumber}`;
}

function isCurrentMember(member, currentUserId, currentUsername, currentDisplayName) {
  if (!member) return false;
  if (currentUserId && member.userId === currentUserId) return true;
  if (currentUsername && member.username === `@${currentUsername}`) return true;
  return member.name === currentDisplayName;
}

function getStatusTone(status) {
  if (status === "Resolved") return { bg: "#e8fde8", color: "#51cf66", border: "#51cf66" };
  return { bg: "#fde8f0", color: "#ff6b9d", border: "#ff6b9d" };
}

function getResponseTone(kind) {
  if (kind === "apology") return { bg: "#e8fde8", border: "#51cf66", shadow: "#51cf66", label: "Apology" };
  if (kind === "clapback") return { bg: "#fff4e6", border: "#ff9a3c", shadow: "#ff9a3c", label: "Clap Back" };
  return { bg: "#e8f4fd", border: "#4ecdc4", shadow: "#4ecdc4", label: "Response" };
}

const IconLogoMark = () => <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" fill="white"/></svg>;
const IconBell = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;

export default function OutsidersDebrief({ onNavigate, appData, setAppData }) {
  const [activeNav, setActiveNav] = useState("Debrief");
  const [showNewModal, setShowNewModal] = useState(false);
  const [activeGroupId, setActiveGroupId] = useState("");
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [responseDraft, setResponseDraft] = useState("");
  const [responseType, setResponseType] = useState("response");
  const [notice, setNotice] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [newCaseForm, setNewCaseForm] = useState({
    groupId: "",
    scope: "personal",
    targetMemberName: "",
    mediatorName: "",
    title: "",
    details: "",
  });

  const groups = useMemo(() => appData?.groups || [], [appData]);

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;

    let active = true;

    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      if (active) setCurrentUser(data.user || null);
    }

    loadUser();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
      if (!session?.user) {
        setCurrentProfile(null);
      }
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !currentUser?.id) return undefined;

    let active = true;

    async function loadProfile() {
      const { data } = await supabase
        .from("profiles")
        .select("username, full_name")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (active) {
        setCurrentProfile(data || null);
      }
    }

    loadProfile();
    return () => {
      active = false;
    };
  }, [currentUser]);

  const currentDisplayName = currentProfile?.full_name || currentUser?.user_metadata?.full_name || "You";
  const currentUsername = currentProfile?.username || currentUser?.user_metadata?.username || "";

  const selectedGroup = useMemo(() => {
    return groups.find((group) => String(group.id) === String(activeGroupId)) || groups[0] || null;
  }, [activeGroupId, groups]);

  const groupMembers = useMemo(() => {
    return selectedGroup?.members || [];
  }, [selectedGroup]);

  const currentMember = useMemo(() => {
    return groupMembers.find((member) => isCurrentMember(member, currentUser?.id, currentUsername, currentDisplayName)) || null;
  }, [currentDisplayName, currentUser, currentUsername, groupMembers]);

  const currentVoteKey = currentUser?.id || (currentUsername ? `username:${currentUsername}` : `name:${currentDisplayName}`);
  const peaceMakerBench = selectedGroup?.peaceMaker || { electedMemberName: "", votes: {}, oath: "" };
  const peaceMakerVoteEntries = Object.entries(peaceMakerBench.votes || {});
  const peaceMakerLeader = selectedGroup?.members?.reduce((best, member) => {
    const memberVotes = peaceMakerVoteEntries.filter(([, chosenName]) => chosenName === member.name).length;
    if (!best || memberVotes > best.votes) {
      return { name: member.name, votes: memberVotes };
    }
    return best;
  }, null);

  const cases = useMemo(() => selectedGroup?.cases || [], [selectedGroup]);
  const visibleCases = useMemo(() => cases.filter((caseItem) => {
    if (caseItem.visibility === "group") return true;
    return (
      caseItem.targetUserId === currentUser?.id ||
      (currentUsername && caseItem.targetUsername === `@${currentUsername}`) ||
      caseItem.targetName === currentDisplayName
    );
  }), [cases, currentDisplayName, currentUser, currentUsername]);
  const selectedCase = visibleCases.find((caseItem) => caseItem.id === selectedCaseId) || visibleCases[0] || null;

  const targetedCases = useMemo(() => {
    if (!selectedGroup) return [];
    return cases.filter((caseItem) => (
      caseItem.visibility === "personal" && (
        caseItem.targetUserId === currentUser?.id ||
        (currentUsername && caseItem.targetUsername === `@${currentUsername}`) ||
        caseItem.targetName === currentDisplayName
      )
    ));
  }, [cases, currentDisplayName, currentUser, currentUsername, selectedGroup]);

  const draftMemberOptions = useMemo(() => {
    const chosenGroup = groups.find((group) => String(group.id) === String(newCaseForm.groupId)) || selectedGroup;
    return (chosenGroup?.members || []).filter((member) => !isCurrentMember(member, currentUser?.id, currentUsername, currentDisplayName));
  }, [currentDisplayName, currentUser, currentUsername, groups, newCaseForm.groupId, selectedGroup]);

  const mediatorOptions = useMemo(() => {
    const chosenGroup = groups.find((group) => String(group.id) === String(newCaseForm.groupId)) || selectedGroup;
    return (chosenGroup?.members || []).filter((member) => (
      member.name !== newCaseForm.targetMemberName &&
      !isCurrentMember(member, currentUser?.id, currentUsername, currentDisplayName)
    ));
  }, [currentDisplayName, currentUser, currentUsername, groups, newCaseForm.groupId, newCaseForm.targetMemberName, selectedGroup]);

  const handleNav = (label) => {
    setActiveNav(label);
    onNavigate?.(NAV_TARGETS[label] || "debrief");
  };

  async function persistGroupPatch(groupId, uiPatch, dbPatch = uiPatch) {
    const nextGroups = groups.map((group) => (
      String(group.id) === String(groupId) ? { ...group, ...uiPatch } : group
    ));

    setAppData?.((prev) => ({ ...prev, groups: nextGroups }));

    if (isSupabaseConfigured && currentUser?.id) {
      const { error } = await supabase
        .from("groups")
        .update(dbPatch)
        .eq("id", groupId);

      if (error) {
        setNotice(error.message);
        return false;
      }
    }

    return true;
  }

  async function persistCases(groupId, nextCases) {
    return persistGroupPatch(groupId, { cases: nextCases });
  }

  async function persistPeaceMaker(groupId, nextPeaceMaker) {
    return persistGroupPatch(groupId, { peaceMaker: nextPeaceMaker }, { peace_maker: nextPeaceMaker });
  }

  async function createCase() {
    const groupId = newCaseForm.groupId || selectedGroup?.id;
    const targetGroup = groups.find((group) => String(group.id) === String(groupId));
    const targetMember = newCaseForm.scope === "group"
      ? null
      : (targetGroup?.members || []).find((member) => member.name === newCaseForm.targetMemberName);

    if (!targetGroup) {
      setNotice("Pick a crew first.");
      return;
    }

    if (newCaseForm.scope === "personal" && !targetMember) {
      setNotice("Pick who this case is about.");
      return;
    }

    if (!newCaseForm.title.trim() || !newCaseForm.details.trim()) {
      setNotice("Add both a case title and the full story.");
      return;
    }

    const nextCase = {
      id: getNextId(targetGroup.cases || [], "case"),
      title: newCaseForm.title.trim(),
      body: newCaseForm.details.trim(),
      visibility: newCaseForm.scope,
      targetName: newCaseForm.scope === "group" ? "Whole group" : targetMember.name,
      targetInitials: newCaseForm.scope === "group" ? "GR" : (targetMember.initials || getInitials(targetMember.name)),
      targetUsername: newCaseForm.scope === "group" ? "" : (targetMember.username || ""),
      targetUserId: newCaseForm.scope === "group" ? null : (targetMember.userId || null),
      mediatorName: newCaseForm.scope === "group"
        ? (targetGroup.peaceMaker?.electedMemberName || "")
        : (newCaseForm.mediatorName || ""),
      status: "Open",
      createdLabel: "Just filed",
      sourceLabel: targetGroup.name,
      anonymous: true,
      updates: [
        {
          id: "update-1",
          kind: "case",
          authorLabel: "Anonymous case",
          body: newCaseForm.details.trim(),
        },
      ],
    };

    const nextCases = [nextCase, ...(targetGroup.cases || [])];
    const saved = await persistCases(targetGroup.id, nextCases);
    if (!saved) return;

    setActiveGroupId(String(targetGroup.id));
    setSelectedCaseId(nextCase.id);
    setShowNewModal(false);
    setNewCaseForm({ groupId: String(targetGroup.id), scope: "personal", targetMemberName: "", mediatorName: "", title: "", details: "" });
    setNotice(newCaseForm.scope === "group" ? "Anonymous group-wide case filed." : `Anonymous personal case filed against ${targetMember.name}.`);
  }

  async function voteForPeaceMaker(memberName) {
    if (!selectedGroup) return;
    const nextPeaceMaker = {
      ...peaceMakerBench,
      electedMemberName: memberName,
      votes: {
        ...(peaceMakerBench.votes || {}),
        [currentVoteKey]: memberName,
      },
      oath: peaceMakerBench.oath || "Hear both sides, cool the temperature, and push the room toward something fair.",
    };

    const saved = await persistPeaceMaker(selectedGroup.id, nextPeaceMaker);
    if (!saved) return;
    setNotice(`${memberName} got your peace-maker vote.`);
  }

  async function sendResponse() {
    if (!selectedGroup || !selectedCase || !responseDraft.trim()) return;

    const nextUpdate = {
      id: getNextId(selectedCase.updates || [], "update"),
      kind: responseType,
      authorLabel: responseType === "apology" ? currentDisplayName : currentMember?.name || currentDisplayName,
      body: responseDraft.trim(),
    };

    const nextCases = cases.map((caseItem) => (
      caseItem.id === selectedCase.id
        ? { ...caseItem, updates: [...(caseItem.updates || []), nextUpdate] }
        : caseItem
    ));

    const saved = await persistCases(selectedGroup.id, nextCases);
    if (!saved) return;

    setResponseDraft("");
    setResponseType("response");
    setNotice(responseType === "apology" ? "Apology posted." : "Response posted.");
  }

  async function toggleCaseStatus() {
    if (!selectedGroup || !selectedCase) return;

    const nextStatus = selectedCase.status === "Resolved" ? "Open" : "Resolved";
    const nextCases = cases.map((caseItem) => (
      caseItem.id === selectedCase.id ? { ...caseItem, status: nextStatus } : caseItem
    ));

    const saved = await persistCases(selectedGroup.id, nextCases);
    if (!saved) return;

    setNotice(nextStatus === "Resolved" ? "Case closed for now." : "Case reopened.");
  }

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
              <div style={{ position: "relative", cursor: "pointer" }} onClick={() => onNavigate?.("profile")}><IconBell /><div className="notif-dot" /></div>
              <div className="profile-chip" onClick={() => onNavigate?.("profile")}>
                <div className="avatar" style={{ width: 30, height: 30, background: "#ff6b6b", fontSize: 11 }}>{getInitials(currentDisplayName)}</div>
                <span style={{ fontWeight: 800, fontSize: 14 }}>{currentDisplayName}</span>
              </div>
            </div>
          </div>
        </nav>

        <div className="layout">
          <aside className="sidebar">
            <p className="nav-section-label">Menu</p>
            {NAV_ITEMS.map((item) => (
              <div key={item.label} className={`nav-item ${activeNav === item.label ? "active" : ""}`} onClick={() => handleNav(item.label)}>
                <span>{item.icon}</span> {item.label}
              </div>
            ))}
          </aside>

          <main className="main">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
              <div>
                <span className="comic-tag">Anonymous court room ⚖️</span>
                <h1 className="bangers" style={{ fontSize: 34, margin: "6px 0 4px" }}>Debrief Court</h1>
                <p style={{ fontSize: 14, color: "#888", fontWeight: 700, margin: 0 }}>File a case anonymously, bring the room into session, and let the named person answer, clap back, or apologize.</p>
              </div>
              <button className="btn-primary" onClick={() => setShowNewModal(true)}>+ File A Case</button>
            </div>

            {notice ? (
              <div style={{ background: "#fff4e6", border: "3px solid #ff9a3c", borderRadius: 12, padding: "12px 16px", boxShadow: "4px 4px 0 #ff9a3c", marginBottom: 20 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "#7a4d00" }}>{notice}</p>
              </div>
            ) : null}

            {groups.length === 0 ? (
              <div className="card" style={{ textAlign: "center" }}>
                <p style={{ fontSize: 38, margin: "0 0 10px" }}>🧱</p>
                <p className="bangers" style={{ fontSize: 24, margin: "0 0 8px" }}>No crew, no red room yet</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#888", margin: "0 0 16px" }}>Create or join a friend group first, then members can file anonymous cases here.</p>
                <button className="btn-secondary" onClick={() => onNavigate?.("friend-groups")}>Go To My Crew</button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div className="card">
                    <p className="bangers" style={{ fontSize: 14, margin: "0 0 10px", color: "#888", letterSpacing: "0.08em", textTransform: "uppercase" }}>Choose crew</p>
                    <select className="form-input" value={selectedGroup?.id || ""} onChange={(event) => { setActiveGroupId(event.target.value); setSelectedCaseId(""); }} style={{ padding: "10px 14px" }}>
                      {groups.map((group) => (
                        <option key={group.id} value={group.id}>{group.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="card" style={{ background: "#fde8f0", borderColor: "#ff6b9d", boxShadow: "5px 5px 0 #ff6b9d" }}>
                    <p className="bangers" style={{ fontSize: 16, margin: "0 0 8px" }}>Against You</p>
                    <p style={{ fontSize: 34, margin: "0 0 4px", fontWeight: 900, color: "#ff6b9d" }}>{targetedCases.length}</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#555", margin: 0 }}>Cases in this room naming you directly.</p>
                  </div>

                  <div className="card" style={{ background: "#fff4e6", borderColor: "#ff9a3c", boxShadow: "5px 5px 0 #ff9a3c" }}>
                    <p className="bangers" style={{ fontSize: 16, margin: "0 0 8px" }}>Room Rules</p>
                    {[
                      "Cases are filed anonymously.",
                      "Speak on behavior, not identity.",
                      "Clap backs stay specific.",
                      "Apologies should name the harm and the fix.",
                    ].map((rule) => (
                      <p key={rule} style={{ fontSize: 12, fontWeight: 800, color: "#555", margin: "0 0 6px" }}>{rule}</p>
                    ))}
                  </div>

                  <div className="card" style={{ background: "#e8f4fd", borderColor: "#4ecdc4", boxShadow: "5px 5px 0 #4ecdc4" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
                      <p className="bangers" style={{ fontSize: 16, margin: 0 }}>Peace-Maker Bench ⚖️</p>
                      <span className="badge" style={{ background: "#fff", color: "#4ecdc4", borderColor: "#4ecdc4" }}>
                        {peaceMakerLeader?.name ? `${peaceMakerLeader.name} leading` : "No vote yet"}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, fontWeight: 800, color: "#555", margin: "0 0 10px" }}>
                      The crew can vote for one trusted peace maker to step in on group cases. One-on-one cases can optionally name a separate mediator.
                    </p>
                    <p style={{ fontSize: 12, fontWeight: 800, color: "#1a1a2e", margin: "0 0 12px" }}>
                      {peaceMakerBench.oath || "Hear both sides, cool the temperature, and push the room toward something fair."}
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {groupMembers.map((member, index) => {
                        const voteCount = peaceMakerVoteEntries.filter(([, chosenName]) => chosenName === member.name).length;
                        const isMyVote = peaceMakerBench.votes?.[currentVoteKey] === member.name;
                        return (
                          <div key={member.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, background: "#fff", border: "2px solid #1a1a2e", borderRadius: 12, padding: "10px 12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div className="avatar" style={{ width: 30, height: 30, background: ["#ff6b6b", "#4ecdc4", "#a29bfe", "#ffd93d", "#51cf66", "#ff6b9d"][index % 6], fontSize: 10 }}>{member.initials}</div>
                              <div>
                                <p style={{ fontSize: 13, fontWeight: 900, margin: 0 }}>{member.name}</p>
                                <p style={{ fontSize: 11, fontWeight: 800, color: "#777", margin: 0 }}>{voteCount} vote{voteCount === 1 ? "" : "s"} {isMyVote ? "· your pick" : ""}</p>
                              </div>
                            </div>
                            <button className="btn-outline" style={{ fontSize: 12, padding: "6px 10px" }} onClick={() => voteForPeaceMaker(member.name)}>
                              {isMyVote ? "Change Vote" : "Vote"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {visibleCases.length === 0 ? (
                      <div style={{ border: "3px dashed #ccc", borderRadius: 14, padding: "18px", textAlign: "center" }}>
                        <p className="bangers" style={{ fontSize: 16, color: "#aaa", margin: "0 0 6px" }}>No visible cases</p>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#888", margin: 0 }}>You’ll see group-wide cases plus any personal cases aimed at you.</p>
                      </div>
                    ) : visibleCases.map((caseItem) => {
                      const tone = getStatusTone(caseItem.status);
                      const isAgainstMe = caseItem.targetUserId === currentUser?.id || (currentUsername && caseItem.targetUsername === `@${currentUsername}`) || caseItem.targetName === currentDisplayName;
                      return (
                        <div
                          key={caseItem.id}
                          className="case-card"
                          style={{
                            background: selectedCase?.id === caseItem.id ? tone.bg : "#fff",
                            borderColor: selectedCase?.id === caseItem.id ? tone.border : "#1a1a2e",
                            boxShadow: `5px 5px 0 ${selectedCase?.id === caseItem.id ? tone.border : "#1a1a2e"}`,
                          }}
                          onClick={() => setSelectedCaseId(caseItem.id)}
                        >
                          <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
                            <p className="bangers" style={{ fontSize: 16, margin: 0 }}>{caseItem.title}</p>
                            <span className="badge" style={{ background: tone.bg, color: tone.color, borderColor: tone.border }}>{caseItem.status}</span>
                          </div>
                          <p style={{ fontSize: 12, fontWeight: 800, color: "#777", margin: "0 0 8px" }}>
                            {caseItem.visibility === "group" ? "Whole-crew case" : `Against ${caseItem.targetName}`}
                          </p>
                          {isAgainstMe ? <span className="badge" style={{ background: "#fff", color: "#ff6b6b", borderColor: "#ff6b6b" }}>You were named</span> : null}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {selectedGroup && selectedCase ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div className="card" style={{ background: "#fffdf9" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                        <div>
                          <span className="comic-tag">Filed anonymously</span>
                          <h2 className="bangers" style={{ fontSize: 26, margin: "10px 0 6px" }}>{selectedCase.title}</h2>
                          <p style={{ fontSize: 13, fontWeight: 800, color: "#888", margin: "0 0 10px" }}>
                            {selectedCase.visibility === "group" ? "Whole group issue" : `Against ${selectedCase.targetName}`} · {selectedCase.sourceLabel}
                          </p>
                          <p style={{ fontSize: 12, fontWeight: 800, color: "#555", margin: "0 0 10px" }}>
                            Peace maker: {selectedCase.mediatorName || (selectedCase.visibility === "group" ? "Use the elected peace maker if needed" : "None assigned")}
                          </p>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div className="avatar" style={{ background: "#1a1a2e" }}>AN</div>
                            <span style={{ fontSize: 13, fontWeight: 800 }}>Anonymous filer</span>
                            <span style={{ fontSize: 13, fontWeight: 800, color: "#aaa" }}>{selectedCase.createdLabel}</span>
                          </div>
                        </div>
                        <button className="btn-outline" onClick={toggleCaseStatus}>
                          {selectedCase.status === "Resolved" ? "Reopen" : "Mark Resolved"}
                        </button>
                      </div>
                    </div>

                    <div className="card">
                      <div className="case-note" style={{ background: "#fff4e6", borderColor: "#ff9a3c", boxShadow: "4px 4px 0 #ff9a3c", marginBottom: 16 }}>
                        <p className="bangers" style={{ fontSize: 14, margin: "0 0 6px", color: "#ff9a3c" }}>The Case</p>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, lineHeight: 1.6 }}>{selectedCase.body}</p>
                      </div>

                      <p className="bangers" style={{ fontSize: 18, margin: "0 0 14px" }}>Thread</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {(selectedCase.updates || []).map((update) => {
                          const tone = getResponseTone(update.kind);
                          return (
                            <div key={update.id} className="case-note" style={{ background: tone.bg, borderColor: tone.border, boxShadow: `4px 4px 0 ${tone.shadow}` }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
                                <span className="badge" style={{ background: "#fff", color: tone.border, borderColor: tone.border }}>{tone.label}</span>
                                <span style={{ fontSize: 12, fontWeight: 800, color: "#666" }}>{update.authorLabel}</span>
                              </div>
                              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, lineHeight: 1.6 }}>{update.body}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="card">
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
                        <p className="bangers" style={{ fontSize: 18, margin: 0 }}>Address The Court</p>
                        <select className="form-input" value={responseType} onChange={(event) => setResponseType(event.target.value)} style={{ width: 180, padding: "10px 14px" }}>
                          <option value="response">Make a response</option>
                          <option value="clapback">Make a clap back</option>
                          <option value="apology">Own it and apologize</option>
                        </select>
                      </div>
                      <textarea
                        className="form-input"
                        rows={5}
                        placeholder="Say your piece clearly. If you caused harm, name it and explain the fix."
                        value={responseDraft}
                        onChange={(event) => setResponseDraft(event.target.value)}
                      />
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginTop: 12 }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: "#777" }}>
                          {selectedCase.visibility === "group"
                            ? "Everyone in the crew can read this thread. The original filer stays anonymous."
                            : "Only the person named can see this private case. The original filer still stays anonymous."}
                        </span>
                        <button className="btn-primary" onClick={sendResponse}>Post Reply</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="card" style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 38, margin: "0 0 10px" }}>🕳️</p>
                  <p className="bangers" style={{ fontSize: 22, margin: "0 0 8px" }}>Pick a case room</p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#888", margin: 0 }}>Select a visible case on the left to read it, clap back, or apologize.</p>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>

        {showNewModal ? (
          <div className="modal-overlay" onClick={() => setShowNewModal(false)}>
            <div className="modal" onClick={(event) => event.stopPropagation()}>
              <button className="close-btn" onClick={() => setShowNewModal(false)}>✕</button>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <span className="comic-tag">Anonymous filing 🕶️</span>
                <h2 className="bangers" style={{ fontSize: 32, margin: "8px 0 4px" }}>Open A Case</h2>
                <p style={{ fontSize: 14, color: "#888", fontWeight: 700, margin: 0 }}>Pick the crew, decide whether this is personal or for the whole room, then file your case.</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label className="form-label">Which crew?</label>
                  <select className="form-input" value={newCaseForm.groupId || selectedGroup?.id || ""} onChange={(event) => setNewCaseForm((current) => ({ ...current, groupId: event.target.value, targetMemberName: "" }))} style={{ padding: "10px 14px" }}>
                    {groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Is this personal or about the whole group?</label>
                  <select className="form-input" value={newCaseForm.scope} onChange={(event) => setNewCaseForm((current) => ({ ...current, scope: event.target.value, targetMemberName: "" }))} style={{ padding: "10px 14px" }}>
                    <option value="personal">Specific person</option>
                    <option value="group">Whole group</option>
                  </select>
                </div>
                {newCaseForm.scope === "personal" ? (
                  <div>
                    <label className="form-label">Who is this against?</label>
                    <select className="form-input" value={newCaseForm.targetMemberName} onChange={(event) => setNewCaseForm((current) => ({ ...current, targetMemberName: event.target.value }))} style={{ padding: "10px 14px" }}>
                      <option value="">Pick a group member</option>
                      {draftMemberOptions.map((member) => <option key={member.name} value={member.name}>{member.name}</option>)}
                    </select>
                  </div>
                ) : null}
                {newCaseForm.scope === "personal" ? (
                  <div>
                    <label className="form-label">Optional peace maker</label>
                    <select className="form-input" value={newCaseForm.mediatorName} onChange={(event) => setNewCaseForm((current) => ({ ...current, mediatorName: event.target.value }))} style={{ padding: "10px 14px" }}>
                      <option value="">No peace maker for now</option>
                      {mediatorOptions.map((member) => <option key={member.name} value={member.name}>{member.name}</option>)}
                    </select>
                  </div>
                ) : (
                  <div style={{ background: "#e8f4fd", border: "3px solid #4ecdc4", borderRadius: 12, padding: "12px 14px", boxShadow: "3px 3px 0 #4ecdc4" }}>
                    <p className="bangers" style={{ fontSize: 14, margin: "0 0 4px" }}>Group peace maker</p>
                    <p style={{ fontSize: 13, fontWeight: 800, color: "#555", margin: 0 }}>
                      {peaceMakerBench.electedMemberName ? `${peaceMakerBench.electedMemberName} is currently the voted peace maker for this crew.` : "No peace maker has been voted in yet."}
                    </p>
                  </div>
                )}
                <div>
                  <label className="form-label">Case title</label>
                  <input className="form-input" type="text" placeholder="Late-night shade in the group chat" value={newCaseForm.title} onChange={(event) => setNewCaseForm((current) => ({ ...current, title: event.target.value }))} />
                </div>
                <div>
                  <label className="form-label">Make your case</label>
                  <textarea className="form-input" rows={6} placeholder="Explain what happened, why it landed badly, and what needs to change." value={newCaseForm.details} onChange={(event) => setNewCaseForm((current) => ({ ...current, details: event.target.value }))} />
                </div>
                <div style={{ background: "#fde8f0", border: "3px solid #ff6b9d", borderRadius: 12, padding: "14px 16px", boxShadow: "3px 3px 0 #ff6b9d" }}>
                  <p className="bangers" style={{ fontSize: 14, margin: "0 0 6px" }}>How this room works</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#555", margin: 0 }}>
                    Your name stays hidden on the case. Personal cases are private to the person named and can optionally include a peace maker. Group cases are visible to everyone in the crew and can rely on the voted peace-maker bench.
                  </p>
                </div>
                <button className="btn-primary" style={{ width: "100%", justifyContent: "center", fontSize: 20, padding: "14px" }} onClick={createCase}>
                  File Anonymous Case
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
