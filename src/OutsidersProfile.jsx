import { useRef, useState } from "react";
import AvailabilitySheet from "./AvailabilitySheet";
import { DEFAULT_PROFILE, getDisplayName } from "./appState";
import NotificationCenter from "./NotificationCenter";
import OutsidersSideNav from "./OutsidersSideNav";
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
  .profile-board {
    background:
      radial-gradient(circle, rgba(201, 179, 104, 0.42) 1.4px, transparent 1.5px),
      linear-gradient(180deg, #fff9ea 0%, #fff6df 100%);
    background-size: 36px 36px, 100% 100%;
    border: 5px solid #1a1a2e;
    border-radius: 28px;
    box-shadow: 0 0 0 4px rgba(255,255,255,0.45) inset;
    padding: 36px 42px 54px;
    position: relative;
    overflow: hidden;
  }
  .profile-board::before {
    content: '';
    position: absolute;
    inset: 16px;
    border: 2px solid rgba(26, 26, 46, 0.08);
    border-radius: 22px;
    pointer-events: none;
  }
  .profile-hero {
    display: grid;
    justify-items: center;
    gap: 22px;
    text-align: center;
    margin-bottom: 30px;
    position: relative;
    z-index: 1;
    max-width: 980px;
    margin-left: auto;
    margin-right: auto;
  }
  .profile-kicker {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    min-width: min(100%, 340px);
    padding: 12px 24px;
    background: #ffd54d;
    border: 5px solid #1a1a2e;
    border-radius: 12px;
    box-shadow: 0 6px 0 #1a1a2e;
    transform: rotate(-1.5deg);
    font: 400 clamp(18px, 2.2vw, 28px) 'Bangers', cursive;
    letter-spacing: 0.08em;
  }
  .profile-title {
    margin: 0;
    font: 400 clamp(52px, 9vw, 96px) 'Bangers', cursive;
    line-height: 0.92;
    letter-spacing: 0.05em;
    color: #ff6b6b;
    text-shadow: 6px 0 0 #1a1a2e, 12px 0 0 rgba(255, 107, 107, 0.18);
  }
  .profile-subtitle {
    position: relative;
    background: #fff;
    border: 5px solid #1a1a2e;
    border-radius: 999px;
    box-shadow: 6px 6px 0 #1a1a2e;
    padding: 16px 32px;
    font: 800 clamp(18px, 2vw, 26px) 'Nunito', sans-serif;
  }
  .profile-subtitle::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: -16px;
    width: 24px;
    height: 24px;
    background: #fff;
    border-right: 5px solid #1a1a2e;
    border-bottom: 5px solid #1a1a2e;
    transform: translateX(-50%) rotate(45deg);
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

  .chip-btn {
    border: 3px solid #1a1a2e;
    background: #fff3c8;
    color: #1a1a2e;
    padding: 9px 14px;
    border-radius: 999px;
    cursor: pointer;
    font: 400 14px 'Bangers', cursive;
    letter-spacing: 0.06em;
    box-shadow: 3px 3px 0 #1a1a2e;
    transition: transform 160ms ease, box-shadow 160ms ease;
    position: relative;
    z-index: 1;
  }
  .chip-btn:hover {
    transform: translate(-1px, -2px);
    box-shadow: 5px 5px 0 #1a1a2e;
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
    width: 46px;
    height: 46px;
    background: #ff7a59;
    border: 3px solid #1a1a2e;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 4px 4px 0 #1a1a2e;
    transform: rotate(-7deg);
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
    overflow: hidden;
  }

  .avatar-circle img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar-tools {
    display: flex;
    gap: 10px;
    margin-top: 10px;
    flex-wrap: wrap;
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

  .danger-btn {
    border: 3px solid #7a1f1f;
    background: #fff3f3;
    color: #7a1f1f;
    box-shadow: 4px 4px 0 #7a1f1f;
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
    .profile-board {
      padding: 24px 18px 28px;
    }
    .profile-kicker {
      min-width: 0;
      width: 100%;
    }
    .panel, .sheet-panel {
      padding: 18px;
      border-radius: 24px;
    }
  }
`;

function initialsFor(profile) {
  const seed = (profile?.name || profile?.username || "You").replace(/^@/, "").trim();
  return seed.slice(0, 2).toUpperCase() || "YO";
}

function weekSummary(availability) {
  const text = availabilityToText(availability);
  return text === "No availability saved" ? "No availability saved yet." : text;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read that photo. Try another image."));
    reader.readAsDataURL(file);
  });
}

function loadImageFromSrc(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not process that photo. Try another image."));
    image.src = src;
  });
}

async function compressAvatarFile(file) {
  const source = await readFileAsDataUrl(file);
  const image = await loadImageFromSrc(source);
  const maxSize = 512;
  const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    return source;
  }

  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.82);
}

function findViewableMember(groups, memberKey, groupId) {
  const scopedGroups = groupId ? groups.filter((group) => String(group.id) === String(groupId)) : groups;
  const loweredKey = String(memberKey || "").toLowerCase();
  for (const group of scopedGroups) {
    const match = (group.members || []).find((member) => {
      const usernameKey = member.username ? `username:${String(member.username).replace(/^@/, "").toLowerCase()}` : "";
      const nameKey = member.name ? `name:${String(member.name).trim().toLowerCase()}` : "";
      return loweredKey === usernameKey || loweredKey === nameKey;
    });
    if (match) return { ...match, groupName: group.name };
  }
  return null;
}

function buildProfileSourceKey({ isViewingOtherProfile, routeParams, sourceProfile, avatar }) {
  return JSON.stringify([
    isViewingOtherProfile ? "member" : "self",
    routeParams?.memberKey || "",
    routeParams?.groupId || "",
    sourceProfile?.id || "",
    sourceProfile?.name || "",
    sourceProfile?.username || "",
    sourceProfile?.email || "",
    sourceProfile?.bio || "",
    sourceProfile?.location || "",
    sourceProfile?.availability || null,
    avatar || "",
  ]);
}

export default function OutsidersProfile(props) {
  const { appData, routeParams = {} } = props;
  const profile = appData?.profile || DEFAULT_PROFILE;
  const groups = appData?.groups || [];
  const viewedMember = findViewableMember(groups, routeParams.memberKey, routeParams.groupId);
  const isViewingOtherProfile = Boolean(viewedMember);
  const sourceProfile = isViewingOtherProfile
    ? {
        ...DEFAULT_PROFILE,
        name: viewedMember.name || "",
        username: String(viewedMember.username || "").replace(/^@/, ""),
        bio: viewedMember.bio || "",
        location: viewedMember.location || "",
        email: viewedMember.email || "",
        availability: viewedMember.availability || DEFAULT_PROFILE.availability,
      }
    : profile;
  const profileSourceKey = buildProfileSourceKey({
    isViewingOtherProfile,
    routeParams,
    sourceProfile,
    avatar: isViewingOtherProfile ? viewedMember?.avatar : appData?.avatar,
  });

  return (
    <OutsidersProfileContent
      key={profileSourceKey}
      {...props}
      profile={profile}
      viewedMember={viewedMember}
      isViewingOtherProfile={isViewingOtherProfile}
      sourceProfile={sourceProfile}
    />
  );
}

function OutsidersProfileContent({
  onNavigate,
  appData,
  setAppData,
  profile = DEFAULT_PROFILE,
  viewedMember,
  isViewingOtherProfile,
  sourceProfile = DEFAULT_PROFILE,
}) {
  const fileRef = useRef(null);
  const profileName = profile.name || profile.username || "You";
  const notifications = appData?.notifications || [];
  const [draft, setDraft] = useState(() => sourceProfile);
  const [draftAvatar, setDraftAvatar] = useState(undefined);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const availabilitySummary = weekSummary(draft.availability);
  const unreadNotifications = notifications.filter((notification) => !notification.read);
  const availabilityReady = hasAvailability(draft.availability);
  const avatarPreview = isViewingOtherProfile
    ? viewedMember?.avatar
    : (draftAvatar === undefined ? appData?.avatar : draftAvatar);
  const avatarToSave = draftAvatar === undefined ? appData?.avatar : draftAvatar;

  const updateField = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSaveError("");
    try {
      const nextAvatar = await compressAvatarFile(file);
      if (typeof nextAvatar === "string") {
        setDraftAvatar(nextAvatar);
        setSaved(false);
      }
    } catch (error) {
      setSaveError(error.message || "Could not read that photo. Try another image.");
    } finally {
      event.target.value = "";
    }
  };

  const saveProfile = async () => {
    if (isViewingOtherProfile) return;
    setSaveError("");
    setSaving(true);

    const previousProfile = appData?.profile || {};
    const cleanUsername = (draft.username || "").trim().replace(/^@/, "").toLowerCase();
    const nextProfile = {
      ...draft,
      username: cleanUsername,
    };

    try {
      if (isSupabaseConfigured) {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        const user = userData?.user || null;

        if (userError || !user) {
          setSaveError("Your session expired. Log in again, then save your profile.");
          setSaving(false);
          return;
        }

        const { error: profileError } = await supabase.rpc("save_my_profile", {
          next_profile_id: user.id,
          next_full_name: (nextProfile.name || "").trim() || user.user_metadata?.full_name || user.email?.split("@")[0] || "You",
          next_username: cleanUsername || user.user_metadata?.username || user.email?.split("@")[0] || `user-${user.id.slice(0, 8)}`,
          next_email: (nextProfile.email || "").trim() || user.email || "",
          next_avatar_url: avatarToSave || null,
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
            full_name: (nextProfile.name || "").trim(),
            username: cleanUsername,
            bio: (nextProfile.bio || "").trim(),
            location: (nextProfile.location || "").trim(),
            availability: nextProfile.availability,
            avatar_url: avatarToSave || null,
          },
        });

        if (authError) {
          console.warn("Profile metadata update failed after profile + availability were saved:", authError.message);
        }

        const nextMemberUsername = cleanUsername ? `@${cleanUsername}` : "";
        const nextGroups = (appData?.groups || []).map((group) => ({
          ...group,
          members: (group.members || []).map((member) => {
            const matchesCurrentUser = member.userId === user.id
              || member.name === (nextProfile.name?.trim() || getDisplayName(previousProfile))
              || (nextMemberUsername && member.username === nextMemberUsername)
              || (previousProfile?.username && member.username === `@${previousProfile.username}`);

            return matchesCurrentUser
              ? {
                  ...member,
                  userId: user.id,
                  name: nextProfile.name?.trim() || member.name,
                  username: nextMemberUsername || member.username,
                  bio: nextProfile.bio,
                  location: nextProfile.location,
                  email: nextProfile.email,
                  initials: initialsFor(nextProfile),
                  availability: nextProfile.availability,
                  avatar: avatarToSave || "",
                }
              : member;
          }),
        }));

        const groupSyncResults = await Promise.all(
          nextGroups.map((group) => supabase
            .from("groups")
            .update({ members: group.members })
            .eq("id", group.id))
        );

        const groupSyncError = groupSyncResults.find((result) => result.error)?.error;
        if (groupSyncError) {
          console.warn("Profile was saved but crew member sync failed:", groupSyncError.message);
          setSaveError(`Profile saved, but some crew cards could not sync yet: ${groupSyncError.message}`);
        }
      }

      setAppData?.((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          ...nextProfile,
        },
        avatar: avatarToSave || null,
        groups: (prev.groups || []).map((group) => ({
          ...group,
          members: (group.members || []).map((member) => {
            const prevDisplayName = getDisplayName(prev.profile);
            const isMe = member.name === prevDisplayName
              || (prev.profile?.username && member.username === `@${prev.profile.username}`);
            return isMe
              ? {
                  ...member,
                  name: (nextProfile.name || "").trim() || prevDisplayName,
                  username: cleanUsername ? `@${cleanUsername}` : member.username,
                  bio: nextProfile.bio,
                  location: nextProfile.location,
                  email: nextProfile.email,
                  initials: initialsFor(nextProfile),
                  availability: nextProfile.availability,
                  avatar: avatarToSave || "",
                }
              : member;
          }),
        })),
      }));

      setDraft(nextProfile);
      setSaved(true);
      setSaving(false);
      window.setTimeout(() => setSaved(false), 1800);
    } catch (error) {
      console.error("Profile save failed:", error);
      setSaveError(
        error?.message === "Failed to fetch"
          ? "Could not reach Supabase. Check your connection, then log in again and retry."
          : (error?.message || "We could not save your profile right now.")
      );
      setSaving(false);
    }
  };

  async function handleDeleteAccount(navigate) {
    if (!isSupabaseConfigured || !supabase) {
      window.alert("Account deletion requires Supabase to be configured.");
      return;
    }

    if (!window.confirm("Permanently delete your account? This cannot be undone.")) return;
    try {
      setDeletingAccount(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.alert("No active session found. Please log in again to delete your account.");
        setDeletingAccount(false);
        navigate?.("login");
        return;
      }

      const { error } = await supabase.rpc("delete_my_account");
      if (error) throw error;

      await supabase.auth.signOut();
      navigate?.("account-deleted");
    } catch (e) {
      console.error(e);
      window.alert(e?.message ?? "Account deletion failed.");
      setDeletingAccount(false);
    }
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="profile-root">
        <OutsidersSideNav activeLabel="Profile" onNavigate={onNavigate} profileName={profileName} notificationCount={unreadNotifications.length} appData={appData} setAppData={setAppData}>
        <div className="profile-shell">
          <section className="profile-board">
          <div className="profile-hero">
            <div className="profile-kicker">
              <span>👤</span>
              <span>{isViewingOtherProfile ? "Crew Profile" : "Your Profile"}</span>
              <span>👤</span>
            </div>
            <h1 className="profile-title">{isViewingOtherProfile ? `${draft.name || "Crew Member"}` : "Profile"}</h1>
            <div className="profile-subtitle">
              {isViewingOtherProfile
                ? `See ${draft.name || "this crew member"}'s profile, availability, and crew-facing details${viewedMember?.groupName ? ` from ${viewedMember.groupName}` : ""}.`
                : "Update your profile and weekly availability here. A profile photo is optional."}
            </div>
          </div>
          <div className="hero-grid">
            <section className="panel profile-card">
            <span className="eyebrow">{availabilityReady ? "Availability live" : "Availability missing"}</span>
              <div style={{ display: "flex", gap: 16, alignItems: "center", marginTop: 16 }}>
                <div className="avatar-circle">
                  {avatarPreview ? <img src={avatarPreview} alt={`${draft.name || "Profile"} avatar`} /> : initialsFor(draft)}
                </div>
                <div>
                  <h1 className="bangers" style={{ margin: "0 0 6px", fontSize: 34 }}>{draft.name || "Set up your profile"}</h1>
                  <p style={{ margin: "0 0 8px", color: "#667085", fontWeight: 700 }}>
                    {draft.username ? `@${draft.username.replace(/^@/, "")}` : "Pick a username so your crew recognizes you."}
                  </p>
                  <p style={{ margin: 0, color: "#475467", lineHeight: 1.6 }}>
                    {draft.bio || (isViewingOtherProfile ? "No bio added yet." : "Tell the crew a little about yourself, then fill out the availability sheet so planning can work around your week.")}
                  </p>
                  {!isViewingOtherProfile ? (
                    <div className="avatar-tools">
                      <button type="button" className="ghost-btn" onClick={() => fileRef.current?.click()}>Upload photo</button>
                      {avatarPreview ? <button type="button" className="ghost-btn" onClick={() => setDraftAvatar("")}>Remove photo</button> : null}
                      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarUpload} />
                    </div>
                  ) : null}
                  {!isViewingOtherProfile ? (
                    <p style={{ margin: "10px 0 0", color: "#667085", fontSize: 13, fontWeight: 700 }}>
                      Photo upload is optional. If you add one, we compress it automatically before saving.
                    </p>
                  ) : null}
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
                {!isViewingOtherProfile ? <button type="button" className="action-btn" onClick={saveProfile} disabled={saving}>{saving ? "Saving..." : "Save Profile"}</button> : null}
                <button type="button" className="ghost-btn" onClick={() => onNavigate?.("friend-groups")}>{isViewingOtherProfile ? "Back To Crew" : "Back To My Crew"}</button>
                {!isViewingOtherProfile ? (
                  <button
                    type="button"
                    className="ghost-btn danger-btn"
                    onClick={() => handleDeleteAccount(onNavigate)}
                    disabled={deletingAccount || saving}
                  >
                    {deletingAccount ? "Deleting Account..." : "Delete Account"}
                  </button>
                ) : null}
              </div>
              {saved && !isViewingOtherProfile ? <p style={{ margin: "14px 0 0", color: "#0f766e", fontWeight: 700 }}>Profile saved and availability updated.</p> : null}
              {saveError ? <p style={{ margin: "14px 0 0", color: "#b42318", fontWeight: 700 }}>{saveError}</p> : null}
            </section>

            <section className="panel">
              <div className="details-grid">
                <div className="field">
                  <label>Full Name</label>
                  <input value={draft.name || ""} readOnly={isViewingOtherProfile} onChange={(event) => updateField("name", event.target.value)} placeholder="Your name" />
                </div>
                <div className="field">
                  <label>Username</label>
                  <input value={draft.username || ""} readOnly={isViewingOtherProfile} onChange={(event) => updateField("username", event.target.value.replace(/^@/, ""))} placeholder="yourhandle" />
                </div>
                <div className="field">
                  <label>Email</label>
                  <input value={draft.email || ""} readOnly={isViewingOtherProfile} onChange={(event) => updateField("email", event.target.value)} placeholder="you@example.com" />
                </div>
                <div className="field">
                  <label>Location</label>
                  <input value={draft.location || ""} readOnly={isViewingOtherProfile} onChange={(event) => updateField("location", event.target.value)} placeholder="Brooklyn, NY" />
                </div>
                <div className="field" style={{ gridColumn: "1 / -1" }}>
                  <label>Bio</label>
                  <textarea value={draft.bio || ""} readOnly={isViewingOtherProfile} onChange={(event) => updateField("bio", event.target.value)} placeholder="What kind of hangouts are you into?" />
                </div>
              </div>

              {!availabilityReady && !isViewingOtherProfile ? (
                <div className="notice-card" style={{ marginTop: 18 }}>
                  <strong style={{ display: "block", marginBottom: 6 }}>Your weekly availability is required.</strong>
                  <span>Tap or drag across the schedule below to mark when you are free. The rest of the app stays locked until this sheet is filled in.</span>
                </div>
              ) : null}
              {isViewingOtherProfile ? (
                <div className="notice-card" style={{ marginTop: 18 }}>
                  <strong style={{ display: "block", marginBottom: 6 }}>Viewing read-only crew profile.</strong>
                  <span>This page shows the details that crew members can reference while planning together.</span>
                </div>
              ) : null}
            </section>
          </div>

          <AvailabilitySheet
            value={draft.availability}
            onChange={(nextAvailability) => setDraft((prev) => ({ ...prev, availability: nextAvailability }))}
            title={isViewingOtherProfile ? "Weekly availability" : "Weekly availability sheet"}
            subtitle={isViewingOtherProfile ? "This member's saved availability helps the crew plan around real free time." : "This is your dedicated availability section as a logged-in user. Mark every half-hour block when you would realistically say yes to a crew plan."}
            required={!isViewingOtherProfile}
            readOnly={isViewingOtherProfile}
            showClear={!isViewingOtherProfile}
            footerAction={!isViewingOtherProfile ? <button type="button" className="availability-btn primary" onClick={saveProfile} disabled={saving}>{saving ? "Saving..." : "Save availability"}</button> : null}
          />

          {!isViewingOtherProfile ? (
          <section className="panel">
            <NotificationCenter
              notifications={notifications}
              setAppData={setAppData}
              onNavigate={onNavigate}
              title="Crew notifications"
              subtitle="This is your personal feed for crew invites, hangouts, trips, and debrief activity."
              emptyTitle="No notifications yet."
              emptyCopy="When someone in one of your crews does something important, it will show up here."
            />
          </section>
          ) : null}
          </section>
        </div>
        </OutsidersSideNav>
      </div>
    </>
  );
}
