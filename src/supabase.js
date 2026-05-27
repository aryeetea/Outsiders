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

export async function hydrateMembersWithProfileLinks(members = []) {
  if (!isSupabaseConfigured || !Array.isArray(members) || !members.length) {
    return { members, changed: false };
  }

  const usernamesToResolve = members
    .filter((member) => !member?.userId && member?.username)
    .map((member) => normalizeLookupUsername(member.username))
    .filter(Boolean);

  if (!usernamesToResolve.length) {
    return { members, changed: false };
  }

  const { data: profileMatches, error } = await supabase
    .from("profiles")
    .select("id, username, email, full_name")
    .in("username", usernamesToResolve);

  if (error || !Array.isArray(profileMatches)) {
    return { members, changed: false };
  }

  const profileByUsername = new Map(
    profileMatches.map((item) => [normalizeLookupUsername(item.username), item])
  );

  let changed = false;
  const nextMembers = members.map((member) => {
    const normalizedUsername = normalizeLookupUsername(member?.username);
    const match = profileByUsername.get(normalizedUsername);
    if (!normalizedUsername || !match) return member;

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
