import { useEffect, useMemo, useState } from "react";
import { getDisplayName } from "./appState";
import OutsidersSideNav from "./OutsidersSideNav";
import { buildGroupInviteLink } from "./siteConfig";
import { isSupabaseConfigured, supabase } from "./supabase";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Nunito:wght@400;600;700;800;900&display=swap');
  * { box-sizing: border-box; }
  body { margin: 0; background: #f7f1dd; }
  .root {
    min-height: 100vh;
    color: #17151f;
    font-family: 'Nunito', sans-serif;
    background: #fff4b8;
  }
  .shell {
    max-width: 1120px;
    margin: 0 auto;
    padding: 28px 20px 48px;
    display: grid;
    gap: 22px;
  }
  .hero, .card {
    border-radius: 22px;
    border: 4px solid #17151f;
    background: #fffdf7;
    box-shadow: 8px 8px 0 #17151f;
  }
  .hero {
    padding: 30px;
    background: #fff2a6;
  }
  .card {
    padding: 24px;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 22px;
  }
  .field {
    display: grid;
    gap: 8px;
  }
  .field label {
    font: 400 14px 'Bangers', cursive;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .field input, .field select {
    width: 100%;
    border: 3px solid #17151f;
    border-radius: 12px;
    padding: 13px 14px;
    background: #fff7e4;
    font: 700 15px 'Nunito', sans-serif;
    color: #17151f;
    box-shadow: 3px 3px 0 #17151f;
    outline: none;
  }
  .field input:focus, .field select:focus {
    border-color: #ff6b6b;
    box-shadow: 4px 4px 0 #ff6b6b;
  }
  .btn {
    border: 3px solid #17151f;
    border-radius: 12px;
    padding: 13px 16px;
    cursor: pointer;
    font: 400 15px 'Bangers', cursive;
    letter-spacing: 0.06em;
    box-shadow: 4px 4px 0 #17151f;
  }
  .btn.primary { background: #ff6b6b; color: #fff; }
  .btn.secondary { background: #ffd93d; color: #17151f; }
  .btn.ghost { background: #fff; color: #17151f; }
  .btn:hover { transform: translate(-1px, -2px); }
  .bangers { font-family: 'Bangers', cursive; letter-spacing: 0.04em; }
  .notice {
    border-radius: 16px;
    border: 3px solid #ff9a3c;
    background: #fff4e6;
    box-shadow: 5px 5px 0 #ff9a3c;
    padding: 14px 16px;
    font-weight: 800;
    color: #7a4d00;
  }
  .invite-box {
    border-radius: 14px;
    border: 3px solid #17151f;
    background: #fff7e4;
    box-shadow: 4px 4px 0 #17151f;
    padding: 14px;
    display: grid;
    gap: 10px;
  }
  .invite-value {
    border-radius: 10px;
    border: 2px dashed rgba(23, 21, 31, 0.42);
    background: #fffdf7;
    padding: 10px 12px;
    overflow-wrap: anywhere;
    font: 800 13px 'Nunito', sans-serif;
    color: #475467;
  }
  @media (max-width: 860px) {
    .grid { grid-template-columns: 1fr; }
    .shell { padding: 18px 14px 36px; }
  }
`;

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function getInitials(name) {
  return (name || "You").replace(/^@/, "").trim().slice(0, 2).toUpperCase() || "YO";
}

function buildMember(profile = {}, currentName = "You", role = "Member", userId = null, avatar = null) {
  return {
    name: currentName,
    initials: getInitials(currentName),
    role,
    userId,
    username: profile.username ? `@${profile.username}` : "",
    bio: profile.bio || "",
    location: profile.location || "",
    email: profile.email || "",
    availability: profile.availability,
    avatar: avatar || "",
  };
}

function normalizeSupabaseGroup(group = {}) {
  return {
    id: group.id,
    name: group.name || "Untitled Crew",
    emoji: group.emoji || "👥",
    code: group.code || "",
    members: Array.isArray(group.members) ? group.members : [],
    pending: Array.isArray(group.pending) ? group.pending : [],
    cases: Array.isArray(group.cases) ? group.cases : [],
    hangoutProposals: Array.isArray(group.hangoutProposals) ? group.hangoutProposals : (Array.isArray(group.hangout_proposals) ? group.hangout_proposals : []),
    billWatch: group.billWatch || group.bill_watch || { electedMemberName: "", votes: {}, checklist: [] },
    peaceMaker: group.peaceMaker || group.peace_maker || { electedMemberName: "", votes: {}, oath: "" },
  };
}

export default function OutsidersCreateCrew({ onNavigate, appData, setAppData, routeParams = {} }) {
  const profile = useMemo(() => appData?.profile || {}, [appData?.profile]);
  const profileName = profile.name || profile.username || "You";
  const currentName = getDisplayName(profile);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupEmoji, setNewGroupEmoji] = useState("👥");
  const [joinCode, setJoinCode] = useState(String(routeParams?.inviteCode || routeParams?.groupCode || "").toUpperCase());
  const [notice, setNotice] = useState("");
  const [generatedInviteLink, setGeneratedInviteLink] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;
    let active = true;
    async function loadCurrentUser() {
      const { data } = await supabase.auth.getUser();
      if (active) setCurrentUserId(data.user?.id || null);
    }
    loadCurrentUser();
    return () => {
      active = false;
    };
  }, []);

  const createCrew = async () => {
    if (!newGroupName.trim()) {
      setNotice("Give the crew a name first.");
      return;
    }

    const nextGroup = {
      id: `group-${Date.now()}`,
      name: newGroupName.trim(),
      emoji: newGroupEmoji,
      code: generateCode(),
      members: [buildMember(profile, currentName, "Admin", currentUserId, appData?.avatar)],
      pending: [],
      cases: [],
      hangoutProposals: [],
      billWatch: { electedMemberName: "", votes: {}, checklist: ["Track who paid", "Post the split", "Confirm balances"] },
      peaceMaker: { electedMemberName: "", votes: {}, oath: "" },
    };

    let savedGroup = nextGroup;
    if (isSupabaseConfigured && currentUserId) {
      const { data, error } = await supabase
        .from("groups")
        .insert({
          name: nextGroup.name,
          emoji: nextGroup.emoji,
          code: nextGroup.code,
          owner_id: currentUserId,
          owner_username: profile.username || "",
          members: nextGroup.members,
          pending: [],
          cases: [],
          hangout_proposals: [],
          bill_watch: nextGroup.billWatch,
          peace_maker: nextGroup.peaceMaker,
        })
        .select("*")
        .single();

      if (error) {
        setNotice(error.message || "We could not create that crew yet.");
        return;
      }
      savedGroup = normalizeSupabaseGroup(data);
    }

    setAppData?.((prev) => ({
      ...prev,
      groups: [...(prev.groups || []), savedGroup],
    }));
    setGeneratedInviteLink(buildGroupInviteLink(savedGroup.code));
    setNotice(`Created ${savedGroup.name}.`);
    setNewGroupName("");
  };

  const joinCrew = async () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) {
      setNotice("Enter a crew or invite code.");
      return;
    }

    let target = (appData?.groups || []).find((group) => (
      group.code === code || (group.pending || []).some((invite) => invite.inviteCode === code)
    ));

    if (!target && isSupabaseConfigured) {
      const { data, error } = await supabase.rpc("find_group_by_join_code", { join_code: code });
      if (error) {
        setNotice(error.message || "We could not look up that crew code.");
        return;
      }
      if (data) target = normalizeSupabaseGroup(data);
    }

    if (!target) {
      setNotice("No crew was found with that code.");
      return;
    }

    const already = (target.members || []).some((member) => (
      member.name === currentName || member.username === `@${profile.username}`
    ));
    if (already) {
      setNotice("You are already in that crew.");
      onNavigate?.("friend-groups");
      return;
    }

    const matchedInvite = (target.pending || []).find((invite) => invite.inviteCode === code) || null;
    const nextMembers = [...(target.members || []), buildMember(profile, currentName, "Member", currentUserId, appData?.avatar)];
    const nextPending = matchedInvite
      ? (target.pending || []).filter((invite) => invite.inviteCode !== matchedInvite.inviteCode)
      : (target.pending || []);

    if (isSupabaseConfigured && target.id) {
      const { error } = await supabase
        .from("groups")
        .update({ members: nextMembers, pending: nextPending })
        .eq("id", target.id);
      if (error) {
        setNotice(error.message || "We could not join that crew yet.");
        return;
      }
    }

    const nextGroup = { ...target, members: nextMembers, pending: nextPending };
    setAppData?.((prev) => ({
      ...prev,
      groups: (prev.groups || []).some((group) => String(group.id) === String(nextGroup.id))
        ? (prev.groups || []).map((group) => (String(group.id) === String(nextGroup.id) ? nextGroup : group))
        : [...(prev.groups || []), nextGroup],
    }));
    setNotice(`Joined ${target.name}.`);
    setJoinCode("");
    onNavigate?.("friend-groups");
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="root">
        <OutsidersSideNav activeLabel="Create Crew" onNavigate={onNavigate} profileName={profileName} notificationCount={(appData?.notifications || []).filter((n) => !n.read).length}>
          <div className="shell">
            <section className="hero">
              <div className="bangers" style={{ fontSize: 18 }}>Crew Setup</div>
              <h1 className="bangers" style={{ margin: "8px 0", fontSize: 48 }}>Create or join a crew.</h1>
              <p style={{ margin: 0, color: "#555", fontWeight: 800, lineHeight: 1.6 }}>Start a new crew here, or use a code to join one your people already made.</p>
            </section>

            {notice ? <div className="notice">{notice}</div> : null}

            <div className="grid">
              <section className="card">
                <h2 className="bangers" style={{ margin: "0 0 14px", fontSize: 28 }}>Create Crew</h2>
                <div className="field">
                  <label>Crew name</label>
                  <input value={newGroupName} onChange={(event) => setNewGroupName(event.target.value)} placeholder="Downtown Day Ones" />
                </div>
                <div className="field" style={{ marginTop: 14 }}>
                  <label>Emoji</label>
                  <select value={newGroupEmoji} onChange={(event) => setNewGroupEmoji(event.target.value)}>
                    {["👥", "🎉", "🍕", "🏝", "🎮", "🌆", "🛼", "🎬"].map((emoji) => <option key={emoji} value={emoji}>{emoji}</option>)}
                  </select>
                </div>
                <button type="button" className="btn primary" style={{ width: "100%", marginTop: 18 }} onClick={createCrew}>Create crew</button>
                {generatedInviteLink ? (
                  <div className="invite-box" style={{ marginTop: 16 }}>
                    <strong>Invite link</strong>
                    <div className="invite-value">{generatedInviteLink}</div>
                  </div>
                ) : null}
              </section>

              <section className="card">
                <h2 className="bangers" style={{ margin: "0 0 14px", fontSize: 28 }}>Join Crew</h2>
                <div className="field">
                  <label>Crew or invite code</label>
                  <input value={joinCode} onChange={(event) => setJoinCode(event.target.value.toUpperCase())} placeholder="ABC123 or ABC123-XY9Z" />
                </div>
                <button type="button" className="btn secondary" style={{ width: "100%", marginTop: 18 }} onClick={joinCrew}>Join crew</button>
                <button type="button" className="btn ghost" style={{ width: "100%", marginTop: 12 }} onClick={() => onNavigate?.("friend-groups")}>Open my crews</button>
              </section>
            </div>
          </div>
        </OutsidersSideNav>
      </div>
    </>
  );
}
