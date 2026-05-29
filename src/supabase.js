import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const supabaseConfigError =
  "Missing Supabase configuration. Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart the dev server.";

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
      },
    })
  : null;

function normalizeLookupUsername(value = "") {
  return String(value || "").replace(/^@/, "").trim().toLowerCase();
}

function normalizeLookupEmail(value = "") {
  return String(value || "").trim().toLowerCase();
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
