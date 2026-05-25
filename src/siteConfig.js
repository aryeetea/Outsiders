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

export function buildTripInviteLink(codeOrParams) {
  const inviteCode = typeof codeOrParams === "object" && codeOrParams !== null
    ? codeOrParams.tripCode
    : codeOrParams;
  const safeCode = encodeURIComponent(String(inviteCode || "").trim().toUpperCase());
  return `${getSiteUrl()}/#/trip-planning${safeCode ? `?tripCode=${safeCode}` : ""}`;
}

export function buildGroupInviteLink(codeOrParams, inviteParams = {}) {
  const params = typeof codeOrParams === "object" && codeOrParams !== null
    ? codeOrParams
    : { groupCode: codeOrParams, ...inviteParams };

  const query = new URLSearchParams();
  if (params.groupCode) query.set("groupCode", String(params.groupCode).trim().toUpperCase());
  if (params.inviteCode) query.set("inviteCode", String(params.inviteCode).trim().toUpperCase());
  if (params.inviteFor) query.set("inviteFor", String(params.inviteFor));

  return `${getSiteUrl()}/#/create-crew${query.size ? `?${query.toString()}` : ""}`;
}
