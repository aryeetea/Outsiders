import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const SUPABASE_AUTH_STORAGE_KEY = "outsiders-supabase-auth";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const supabaseConfigError =
  "Missing Supabase configuration. Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart the dev server.";

function normalizeProfileUsername(value = "", fallbackEmail = "", fallbackId = "") {
  const cleaned = String(value || "").replace(/^@/, "").trim().toLowerCase();
  if (cleaned) return cleaned;

  const emailLocalPart = String(fallbackEmail || "").split("@")[0]?.trim().toLowerCase();
  if (emailLocalPart) return emailLocalPart;

  const idText = String(fallbackId || "").replace(/-/g, "").trim().toLowerCase();
  return idText ? `user-${idText.slice(0, 8)}` : "user";
}

function getLegacySupabaseStorageKey() {
  if (!supabaseUrl) return null;

  try {
    const { hostname } = new URL(supabaseUrl);
    const projectRef = hostname.split(".")[0];
    return projectRef ? `sb-${projectRef}-auth-token` : null;
  } catch {
    return null;
  }
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: SUPABASE_AUTH_STORAGE_KEY,
        storage: typeof window !== "undefined" ? window.localStorage : undefined,
      },
    })
  : null;

export function clearSupabaseAuthStorage() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(SUPABASE_AUTH_STORAGE_KEY);

  const legacyStorageKey = getLegacySupabaseStorageKey();
  if (legacyStorageKey) {
    window.localStorage.removeItem(legacyStorageKey);
  }
}

function normalizeLookupUsername(value = "") {
  return String(value || "").replace(/^@/, "").trim().toLowerCase();
}

function normalizeLookupEmail(value = "") {
  return String(value || "").trim().toLowerCase();
}

export async function ensureCurrentUserProfile(user) {
  if (!isSupabaseConfigured || !user?.id) {
    return { profile: null, repaired: false };
  }

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id, full_name, username, email, avatar_url, availability")
    .eq("id", user.id)
    .maybeSingle();

  const nextFullName = String(
    existingProfile?.full_name
    || user.user_metadata?.full_name
    || user.email?.split("@")[0]
    || "You"
  ).trim();
  const nextEmail = String(existingProfile?.email || user.email || "").trim();
  const nextUsername = normalizeProfileUsername(
    existingProfile?.username || user.user_metadata?.username,
    nextEmail,
    user.id
  );
  const nextAvatarUrl = existingProfile?.avatar_url || user.user_metadata?.avatar_url || null;

  const needsRepair = !existingProfile
    || !String(existingProfile.full_name || "").trim()
    || !String(existingProfile.username || "").trim()
    || !String(existingProfile.email || "").trim();

  if (!needsRepair) {
    return { profile: existingProfile, repaired: false };
  }

  const { data: repairedProfile, error } = await supabase.rpc("save_my_profile", {
    next_profile_id: user.id,
    next_full_name: nextFullName,
    next_username: nextUsername,
    next_email: nextEmail,
    next_avatar_url: nextAvatarUrl,
  });

  if (error) {
    return { profile: existingProfile, repaired: false, error };
  }

  return { profile: repairedProfile || existingProfile || null, repaired: true };
}

export async function hydrateMembersWithProfileLinks(members = []) {
  if (!isSupabaseConfigured || !Array.isArray(members) || !members.length) {
    return { members, changed: false };
  }

  const usernamesToResolve = members
    .filter((member) => !member?.userId && member?.username)
    .map((member) => normalizeLookupUsername(member.username))
    .filter(Boolean);
  const emailsToResolve = members
    .filter((member) => !member?.userId && member?.email)
    .map((member) => normalizeLookupEmail(member.email))
    .filter(Boolean);

  if (!usernamesToResolve.length && !emailsToResolve.length) {
    return { members, changed: false };
  }

  const profileMatches = [];

  if (usernamesToResolve.length) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, email, full_name")
      .in("username", usernamesToResolve);

    if (error || !Array.isArray(data)) {
      return { members, changed: false };
    }

    profileMatches.push(...data);
  }

  if (emailsToResolve.length) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, email, full_name")
      .in("email", emailsToResolve);

    if (error || !Array.isArray(data)) {
      return { members, changed: false };
    }

    profileMatches.push(...data);
  }

  const profileByUsername = new Map(
    profileMatches.map((item) => [normalizeLookupUsername(item.username), item])
  );
  const profileByEmail = new Map(
    profileMatches.map((item) => [normalizeLookupEmail(item.email), item])
  );

  let changed = false;
  const nextMembers = members.map((member) => {
    const normalizedUsername = normalizeLookupUsername(member?.username);
    const normalizedEmail = normalizeLookupEmail(member?.email);
    if (!normalizedUsername && !normalizedEmail) return member;

    const match = profileByUsername.get(normalizedUsername) || profileByEmail.get(normalizedEmail);
    if (!match) return member;

    const nextMember = {
      ...member,
      userId: member.userId || match.id,
      email: member.email || match.email || "",
      name: member.name || match.full_name || member.name,
    };

    if (
      nextMember.userId !== member.userId
      || nextMember.email !== member.email
      || nextMember.name !== member.name
    ) {
      changed = true;
    }

    return nextMember;
  });

  return { members: nextMembers, changed };
}

export async function deleteCurrentUserAccount() {
  if (!isSupabaseConfigured || !supabase) {
    return { error: new Error("Supabase is not configured.") };
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user?.id) {
    return { error: new Error("Your session expired. Log in again, then delete your account.") };
  }

  const { error } = await supabase.rpc("delete_my_account");
  if (error) {
    return { ok: false, error };
  }
  
  clearSupabaseAuthStorage();
  return { ok: true, error: null };
}
