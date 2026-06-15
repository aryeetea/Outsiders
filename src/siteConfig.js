const DEFAULT_SITE_URL = "https://outsiderescapeclub.website";
const DEFAULT_TRIP_COM_URL = "https://us.trip.com";

export function getSiteUrl() {
  const configured = import.meta.env.VITE_SITE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  return DEFAULT_SITE_URL;
}

export function buildAppUrl(screen = "", params = {}) {
  const normalizedScreen = String(screen || "").replace(/^#\/?/, "").trim();
  const query = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") return;
    query.set(key, String(value));
  });

  return `${getSiteUrl()}/#/${normalizedScreen}${query.size ? `?${query.toString()}` : ""}`;
}

export function buildTripComHotelsLink(destination) {
  const params = new URLSearchParams();
  if (destination) params.set("searchWord", String(destination).trim());
  params.set("locale", "en-US");
  params.set("curr", "USD");
  return `${DEFAULT_TRIP_COM_URL}/hotels/${params.size ? `?${params.toString()}` : ""}`;
}

export function buildTripComFlightsLink() {
  return `${DEFAULT_TRIP_COM_URL}/flights/?curr=USD&locale=en-US`;
}

export function buildTripComPackagesLink() {
  return `${DEFAULT_TRIP_COM_URL}/packages/`;
}

export function buildGroupInviteLink(codeOrParams) {
  const params = typeof codeOrParams === "object" && codeOrParams !== null
    ? codeOrParams
    : { groupCode: codeOrParams };
  return buildAppUrl("create-crew", {
    groupCode: params.groupCode ? String(params.groupCode).trim().toUpperCase() : "",
    inviteCode: params.inviteCode ? String(params.inviteCode).trim().toUpperCase() : "",
  });
}
