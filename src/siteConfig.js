const DEFAULT_SITE_URL = "https://outsiders-alpha.vercel.app";

export function getSiteUrl() {
  const configured = import.meta.env.VITE_SITE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  return DEFAULT_SITE_URL;
}

export function buildHangoutInviteLink(code) {
  const safeCode = encodeURIComponent((code || "").trim().toUpperCase());
  return `${getSiteUrl()}/#/join-hangout?code=${safeCode}`;
}

export function buildGroupInviteLink(code) {
  const safeCode = encodeURIComponent((code || "").trim().toUpperCase());
  return `${getSiteUrl()}/#/friend-groups?groupCode=${safeCode}`;
}
