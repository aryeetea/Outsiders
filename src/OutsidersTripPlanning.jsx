import { useEffect, useMemo, useState } from "react";
import { createId, getDisplayName, getVisibleGroupsForProfile } from "./appState";
import { sendNotificationEmails } from "./notificationEmail";
import OutsidersSideNav from "./OutsidersSideNav";
import { buildAppUrl, buildTripComFlightsLink, buildTripComHotelsLink, buildTripComPackagesLink } from "./siteConfig";
import { isSupabaseConfigured, supabase } from "./supabase";

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
    position: fixed; inset: 0;
    background-image: radial-gradient(circle, #1a1a2e 1px, transparent 1px);
    background-size: 24px 24px;
    opacity: 0.03;
    pointer-events: none; z-index: 0;
  }

  .bangers { font-family: 'Bangers', cursive; letter-spacing: 0.04em; }

  .main { flex: 1; padding: 28px 32px; overflow-y: auto; }

  .trip-planning-shell {
    background:
      radial-gradient(circle, rgba(201, 179, 104, 0.5) 1.4px, transparent 1.5px),
      linear-gradient(180deg, #fff9ea 0%, #fff6df 100%);
    background-size: 36px 36px, 100% 100%;
    border: 5px solid #1a1a2e;
    border-radius: 28px;
    box-shadow: 0 0 0 4px rgba(255,255,255,0.45) inset;
    padding: 36px 42px 54px;
    position: relative;
    overflow: hidden;
  }

  .trip-planning-shell::before {
    content: "";
    position: absolute;
    inset: 16px;
    border: 2px solid rgba(26, 26, 46, 0.08);
    border-radius: 22px;
    pointer-events: none;
  }

  .trip-planning-shell::after {
    content: "";
    position: absolute;
    right: 46px;
    top: 44px;
    width: 56px;
    height: 56px;
    border-radius: 16px;
    background: rgba(255,255,255,0.82);
    box-shadow: 0 10px 24px rgba(26, 26, 46, 0.08);
  }

  .trip-hero {
    display: grid;
    justify-items: center;
    gap: 22px;
    text-align: center;
    margin-bottom: 34px;
    position: relative;
    z-index: 1;
    max-width: 980px;
    margin-left: auto;
    margin-right: auto;
  }

  .trip-kicker {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 18px;
    min-width: min(100%, 420px);
    padding: 12px 28px;
    background: #ffd54d;
    border: 5px solid #1a1a2e;
    border-radius: 12px;
    box-shadow: 0 6px 0 #1a1a2e;
    transform: rotate(-1.5deg);
    font: 400 clamp(18px, 2.2vw, 28px) 'Bangers', cursive;
    letter-spacing: 0.08em;
  }

  .trip-title {
    margin: 0;
    font: 400 clamp(56px, 11vw, 120px) 'Bangers', cursive;
    line-height: 0.9;
    letter-spacing: 0.06em;
    color: #ff6b6b;
    text-shadow: 6px 0 0 #1a1a2e, 12px 0 0 rgba(255, 107, 107, 0.18);
  }

  .trip-title-plane {
    display: inline-block;
    margin-left: 14px;
    transform: rotate(12deg) translateY(-4px);
    filter: drop-shadow(4px 4px 0 #ff6b6b);
  }

  .trip-actions-row {
    display: flex;
    gap: 18px;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
  }

  .speech-pill {
    position: relative;
    background: #fff;
    border: 5px solid #1a1a2e;
    border-radius: 999px;
    box-shadow: 6px 6px 0 #1a1a2e;
    padding: 16px 32px;
    font: 800 clamp(18px, 2vw, 28px) 'Nunito', sans-serif;
  }

  .speech-pill::after {
    content: "";
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

  .trip-new-btn {
    background: #fff8ea;
    color: #1a1a2e;
    border: 3px solid rgba(26, 26, 46, 0.18);
    border-bottom: 7px solid #1a1a2e;
    border-right: 7px solid #1a1a2e;
    border-radius: 18px;
    box-shadow: none;
    padding: 18px 30px;
    font-size: 18px;
  }

  .trip-new-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: none;
  }

  .trip-section-label {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 8px 0 18px;
    color: #888a95;
    font: 400 22px 'Bangers', cursive;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .trip-section-label::before {
    content: "▸";
    font-size: 18px;
  }

  .trip-empty-panel {
    background: rgba(255,255,255,0.84);
    border: 5px dashed #1a1a2e;
    border-radius: 24px;
    min-height: 470px;
    display: grid;
    place-items: center;
    padding: 48px 24px;
    position: relative;
    overflow: hidden;
  }

  .trip-empty-panel::before {
    content: "";
    position: absolute;
    right: 42px;
    top: 24px;
    width: 120px;
    height: 120px;
    background-image: radial-gradient(circle, rgba(26,26,46,0.14) 2px, transparent 2.4px);
    background-size: 18px 18px;
    border-radius: 50%;
    opacity: 0.8;
  }

  .trip-empty-content {
    display: grid;
    justify-items: center;
    gap: 18px;
    text-align: center;
    max-width: 640px;
    position: relative;
    z-index: 1;
  }

  .trip-stamp {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: #4ecdc4;
    border: 5px solid #1a1a2e;
    border-radius: 10px;
    box-shadow: 0 5px 0 #1a1a2e;
    padding: 14px 26px;
    transform: rotate(1.5deg);
    font: 400 20px 'Bangers', cursive;
    letter-spacing: 0.06em;
  }

  .trip-empty-title {
    margin: 0;
    font: 400 clamp(40px, 6vw, 70px) 'Bangers', cursive;
    line-height: 0.95;
    color: #1a1a2e;
  }

  .trip-empty-copy {
    margin: 0;
    font: 800 clamp(18px, 2.1vw, 28px) 'Nunito', sans-serif;
    line-height: 1.35;
    color: #5a5c66;
  }

  .trip-list-stack {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .trip-column-card {
    background: rgba(255,255,255,0.72);
    border: 3px solid rgba(26, 26, 46, 0.14);
    border-radius: 22px;
    padding: 20px;
    box-shadow: 0 10px 24px rgba(26, 26, 46, 0.06);
  }

  .trip-column-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
  }

  .trip-count-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 36px;
    height: 36px;
    padding: 0 12px;
    border-radius: 999px;
    background: #fff;
    border: 3px solid #1a1a2e;
    box-shadow: 3px 3px 0 #1a1a2e;
    font: 400 16px 'Bangers', cursive;
    letter-spacing: 0.06em;
    color: #1a1a2e;
  }

  .trip-detail-layout {
    display: grid;
    gap: 24px;
    grid-template-columns: minmax(240px, 280px) minmax(0, 1fr);
    align-items: start;
  }

  .card {
    background: #fff;
    border: 3px solid #1a1a2e;
    border-radius: 16px;
    box-shadow: 5px 5px 0 #1a1a2e;
    padding: 22px 24px;
  }

  .invite-value {
    border-radius: 12px;
    border: 2px dashed rgba(26, 26, 46, 0.25);
    background: #fffdf7;
    padding: 10px 12px;
    font: 800 13px 'Nunito', sans-serif;
    color: #475467;
    overflow-wrap: anywhere;
  }

  .tag-toggle {
    border: 3px solid #1a1a2e;
    border-radius: 999px;
    background: #fff;
    color: #1a1a2e;
    padding: 10px 14px;
    font: 400 14px 'Bangers', cursive;
    letter-spacing: 0.05em;
    box-shadow: 3px 3px 0 #1a1a2e;
    cursor: pointer;
  }
  .tag-toggle.active {
    background: #ffd93d;
  }
  .trip-section-box {
    display: grid;
    gap: 14px;
    padding: 16px;
    border-radius: 16px;
    background: #fffdf7;
    border: 2px dashed rgba(26, 26, 46, 0.18);
  }
  .collapsible-block {
    border: 2px dashed rgba(26, 26, 46, 0.18);
    border-radius: 16px;
    background: #fffdf7;
    overflow: hidden;
  }
  .collapsible-block summary {
    list-style: none;
    cursor: pointer;
    padding: 16px 18px;
    font: 400 20px 'Bangers', cursive;
    letter-spacing: 0.04em;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .collapsible-block summary::-webkit-details-marker {
    display: none;
  }
  .collapsible-content {
    display: grid;
    gap: 14px;
    padding: 0 18px 18px;
  }
  .itinerary-workspace {
    display: grid;
    grid-template-columns: minmax(270px, 340px) minmax(0, 1fr);
    gap: 18px;
    align-items: start;
  }

  .trip-card {
    background: #fff;
    border: 3px solid #1a1a2e;
    border-radius: 16px;
    box-shadow: 5px 5px 0 #1a1a2e;
    padding: 20px 22px;
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s;
  }
  .trip-card:hover { transform: translate(-2px,-2px); box-shadow: 7px 7px 0 #1a1a2e; }
  .trip-card.active { border-color: #ff6b6b; box-shadow: 5px 5px 0 #ff6b6b; }

  .tab {
    padding: 9px 20px;
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

  .btn-primary {
    background: #ff6b6b; color: #fff;
    border: 3px solid #1a1a2e; cursor: pointer;
    font-family: 'Bangers', cursive; letter-spacing: 0.08em;
    border-radius: 10px; box-shadow: 4px 4px 0 #1a1a2e;
    transition: transform 0.12s, box-shadow 0.12s;
    font-size: 16px; padding: 10px 20px;
    display: inline-flex; align-items: center; gap: 8px;
  }
  .btn-primary:hover { transform: translate(-2px,-2px); box-shadow: 6px 6px 0 #1a1a2e; }
  .btn-primary:active { transform: translate(2px,2px); box-shadow: 2px 2px 0 #1a1a2e; }

  .btn-secondary {
    background: #ffd93d; color: #1a1a2e;
    border: 3px solid #1a1a2e; cursor: pointer;
    font-family: 'Bangers', cursive; letter-spacing: 0.08em;
    border-radius: 10px; box-shadow: 4px 4px 0 #1a1a2e;
    transition: transform 0.12s, box-shadow 0.12s;
    font-size: 15px; padding: 9px 18px;
    display: inline-flex; align-items: center; gap: 8px;
  }
  .btn-secondary:hover { transform: translate(-2px,-2px); box-shadow: 6px 6px 0 #1a1a2e; }

  .btn-outline {
    background: #fff; color: #1a1a2e;
    border: 3px solid #1a1a2e; cursor: pointer;
    font-family: 'Bangers', cursive; letter-spacing: 0.08em;
    border-radius: 10px; box-shadow: 3px 3px 0 #1a1a2e;
    transition: transform 0.12s, box-shadow 0.12s;
    font-size: 14px; padding: 8px 16px;
    display: inline-flex; align-items: center; gap: 6px;
  }
  .btn-outline:hover { transform: translate(-2px,-2px); box-shadow: 5px 5px 0 #1a1a2e; }

  .btn-danger {
    background: #fff; color: #ff6b6b;
    border: 2px solid #ff6b6b; cursor: pointer;
    font-family: 'Bangers', cursive; letter-spacing: 0.05em;
    border-radius: 8px; font-size: 13px; padding: 5px 10px;
    transition: background 0.15s;
  }
  .btn-danger:hover { background: #fde8e8; }

  .form-input {
    width: 100%;
    padding: 11px 14px;
    font-size: 14px;
    font-family: 'Nunito', sans-serif;
    font-weight: 700; color: #1a1a2e;
    background: #fffdf9;
    border: 3px solid #1a1a2e;
    border-radius: 10px; outline: none;
    transition: box-shadow 0.15s, border-color 0.15s;
    box-shadow: 3px 3px 0 #1a1a2e;
  }
  .form-input:focus { border-color: #ff6b6b; box-shadow: 3px 3px 0 #ff6b6b; }
  .form-input::placeholder { color: #bbb; font-weight: 600; }

  .form-label {
    display: block;
    font-family: 'Bangers', cursive;
    font-size: 15px; letter-spacing: 0.05em;
    color: #1a1a2e; margin-bottom: 6px;
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

  .comic-tag {
    display: inline-block;
    background: #ffd93d; border: 2px solid #1a1a2e;
    border-radius: 6px; padding: 1px 10px;
    font-family: 'Bangers', cursive; font-size: 12px;
    letter-spacing: 0.06em; box-shadow: 2px 2px 0 #1a1a2e;
    transform: rotate(-2deg);
  }

  .day-card {
    background: #fffdf9;
    border: 3px solid #1a1a2e;
    border-radius: 14px;
    padding: 16px 18px;
    box-shadow: 4px 4px 0 #1a1a2e;
    margin-bottom: 14px;
  }

  .activity-row {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 0;
    border-bottom: 2px dashed #f0ebe0;
  }
  .activity-row:last-child { border-bottom: none; }

  .pack-item {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 0;
    border-bottom: 2px dashed #f0ebe0;
    cursor: pointer;
  }
  .pack-item:last-child { border-bottom: none; }

  .checkbox {
    width: 22px; height: 22px;
    border: 3px solid #1a1a2e;
    border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    transition: background 0.15s;
    box-shadow: 2px 2px 0 #1a1a2e;
  }

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
    width: 100%; max-width: 500px;
    position: relative;
    max-height: 90vh;
    overflow-y: auto;
  }

  .close-btn {
    position: absolute; top: 16px; right: 16px;
    background: #f5f3ee; border: 2px solid #1a1a2e;
    border-radius: 50%; width: 32px; height: 32px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 16px;
    box-shadow: 2px 2px 0 #1a1a2e;
  }

  .budget-bar {
    height: 14px;
    background: #f0ebe0;
    border: 2px solid #1a1a2e;
    border-radius: 99px;
    overflow: hidden;
    margin-top: 8px;
  }
  .budget-fill {
    height: 100%;
    border-radius: 99px;
    transition: width 0.5s ease;
  }
  .trip-overview-grid, .trip-modal-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .trip-activity-grid { grid-template-columns: 100px 80px minmax(0, 1fr) auto; }
  @media (max-width: 1024px) {
    .main { padding: 24px 20px; }
    .trip-detail-layout, .trip-overview-grid, .trip-modal-grid, .trip-activity-grid, .itinerary-workspace { grid-template-columns: 1fr; }
    .trip-planning-shell { padding: 28px 22px 36px; }
    .trip-empty-panel { min-height: 380px; }
  }
  @media (max-width: 640px) {
    .main { padding: 18px 14px; }
    .trip-planning-shell { padding: 20px 16px 28px; }
    .trip-kicker { min-width: 0; width: 100%; }
    .speech-pill { padding: 14px 20px; }
    .trip-new-btn { width: 100%; justify-content: center; }
    .trip-empty-panel { padding: 34px 18px; }
  }
`;

const AVATAR_COLORS = ["#ff6b6b", "#4ecdc4", "#a29bfe", "#ffd93d", "#51cf66", "#ff6b9d"];
const TRIP_COLORS = [
  { bg: "#fff4e6", border: "#ff9a3c", emoji: "🏝" },
  { bg: "#e8f4fd", border: "#4ecdc4", emoji: "🗼" },
  { bg: "#f3e8fd", border: "#9b59b6", emoji: "🏔" },
];

const IconPlus = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconCheck = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconTrash = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>;

const formatDate = (d) => {
  if (!d) return "";
  const date = new Date(d + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const getDays = (start, end) => {
  if (!start || !end) return 0;
  return Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)) + 1;
};

function buildDefaultChecklist() {
  return [
    { id: createId("trip-check"), label: "Confirm who is going", done: false },
    { id: createId("trip-check"), label: "Lock transport and stay details", done: false },
    { id: createId("trip-check"), label: "Pick the must-do stops", done: false },
    { id: createId("trip-check"), label: "Double-check arrival and check-in timing", done: false },
    { id: createId("trip-check"), label: "Double-check packing", done: false },
  ];
}

const TRIP_INTEREST_OPTIONS = [
  "Food",
  "History",
  "Nature",
  "Shopping",
  "Nightlife",
  "Faith",
  "Museums",
  "Relaxing",
];

function getDefaultBookingInfo() {
  return {
    hasBookingInfo: "no",
    arrivalDate: "",
    arrivalTime: "",
    departureTime: "",
    arrivalCity: "",
    layoverCity: "",
    stayName: "",
    stayArea: "",
    notes: "",
  };
}

function buildSavingsProgress(members = [], profile = {}, currentUserId = null) {
  const fallbackName = getDisplayName(profile);
  if (!members.length) {
    return [{
      id: createId("saving"),
      userId: currentUserId || null,
      username: profile?.username ? `@${String(profile.username).replace(/^@/, "")}` : "",
      name: fallbackName,
      saved: 0,
    }];
  }

  return members.map((member, index) => ({
    id: member.id || member.userId || createId(`saving-${index}`),
    userId: member.userId || null,
    username: member.username || "",
    name: member.name || member.username || fallbackName,
    saved: Number(member.saved) || 0,
  }));
}

function buildMemberSavingsTargets(members = [], totalGoal = 0) {
  const targetPerPerson = members.length ? Math.round((Number(totalGoal || 0) / members.length) * 100) / 100 : 0;
  return members.map((member, index) => ({
    id: member.id || member.userId || createId(`target-${index}`),
    userId: member.userId || null,
    username: member.username || "",
    name: member.name || member.username || `Traveler ${index + 1}`,
    target: targetPerPerson,
  }));
}

async function requestTripItinerarySuggestions(trip) {
  const response = await fetch("/api/trip-itinerary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      trip: {
        name: trip.name,
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        budget: trip.budget,
        days: trip.itinerary?.length || 0,
        bookingInfo: trip.bookingInfo || {},
        tripPreferences: trip.tripPreferences || [],
        members: trip.members || [],
      },
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error || "We could not build itinerary ideas right now.");
  }

  return Array.isArray(payload?.suggestions) ? payload.suggestions : [];
}

export default function OutsidersTripPlanning({ onNavigate, appData, setAppData, routeParams = {} }) {
  const trips = useMemo(() => appData?.trips || [], [appData?.trips]);
  const groups = useMemo(() => getVisibleGroupsForProfile(appData?.groups || [], appData?.profile || {}), [appData?.groups, appData?.profile]);
  const [selectedTripId, setSelectedTripId] = useState(() => (appData?.trips?.[0]?.id || null));
  const [currentUserId, setCurrentUserId] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newActivity, setNewActivity] = useState({ day: 1, time: "", name: "" });
  const [newPackItem, setNewPackItem] = useState("");
  const [newTripForm, setNewTripForm] = useState({
    name: "",
    destination: "",
    startDate: "",
    endDate: "",
    budget: "",
    groupId: "",
    tripPreferences: [],
    bookingInfo: getDefaultBookingInfo(),
  });
  const [formError, setFormError] = useState("");
  const [aiError, setAiError] = useState("");
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);

  const routeTripId = String(routeParams?.tripId || "").trim();
  const selectedTrip = (
    (routeTripId ? trips.find((trip) => String(trip.id) === routeTripId) : null)
    || trips.find((trip) => trip.id === selectedTripId)
    || trips[0]
    || null
  );
  const currentProfile = appData?.profile || {};
  const effectiveCurrentUserId = currentUserId || currentProfile?.id || null;
  const currentUserDisplayName = getDisplayName(currentProfile);
  const currentUsername = currentProfile?.username ? `@${String(currentProfile.username).replace(/^@/, "").toLowerCase()}` : "";

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

  const persistTrips = (updater, nextSelectedTripId = null) => {
    setAppData?.((prev) => {
      const previousTrips = prev?.trips || [];
      const nextTrips = typeof updater === "function" ? updater(previousTrips) : updater;
      const selectedId = nextSelectedTripId === null ? selectedTrip?.id : nextSelectedTripId;
      setSelectedTripId(selectedId ? nextTrips.find((trip) => trip.id === selectedId)?.id || nextTrips[0]?.id || null : nextTrips[0]?.id || null);
      return { ...prev, trips: nextTrips };
    });
  };

  const selectedTripGroup = selectedTrip?.groupId
    ? groups.find((group) => String(group.id) === String(selectedTrip.groupId)) || null
    : null;
  const editableSavingsEntry = (selectedTrip?.savingsProgress || []).find((entry) => (
    (entry.userId && effectiveCurrentUserId && String(entry.userId) === String(effectiveCurrentUserId))
    || (entry.username && currentUsername && String(entry.username).toLowerCase() === currentUsername)
    || String(entry.name || "").trim().toLowerCase() === currentUserDisplayName.trim().toLowerCase()
  )) || null;
  const travelerCount = Math.max(selectedTrip?.members?.length || 0, 1);
  const tripComHotelsLink = selectedTrip ? buildTripComHotelsLink(selectedTrip.destination) : "";
  const tripComFlightsLink = buildTripComFlightsLink();
  const tripComPackagesLink = buildTripComPackagesLink();
  const isTripHost = Boolean(effectiveCurrentUserId && String(selectedTrip?.creatorId || "") === String(effectiveCurrentUserId));
  const totalGroupSaved = (selectedTrip?.savingsProgress || []).reduce((sum, entry) => sum + (Number(entry.saved) || 0), 0);
  const groupSavingsGoal = Number(selectedTrip?.groupSavingsGoal) || Number(selectedTrip?.budget) || 0;
  const memberSavingsTargets = (selectedTrip?.memberSavingsTargets || []).length
    ? (selectedTrip.memberSavingsTargets || [])
    : buildMemberSavingsTargets((selectedTrip?.savingsProgress || []).map((entry) => ({
      id: entry.id,
      userId: entry.userId,
      username: entry.username,
      name: entry.name,
    })), groupSavingsGoal);
  const personalSavingsTarget = Number(
    memberSavingsTargets.find((item) => item.name === currentUserDisplayName || item.userId === effectiveCurrentUserId || item.username === currentUsername)?.target
  ) || (groupSavingsGoal ? Math.round((groupSavingsGoal / travelerCount) * 100) / 100 : 0);
  const personalSavings = Number(editableSavingsEntry?.saved) || 0;
  const remainingToSave = selectedTrip ? Math.max(personalSavingsTarget - personalSavings, 0) : 0;
  const savingsPct = personalSavingsTarget ? Math.min(Math.round((personalSavings / personalSavingsTarget) * 100), 100) : 0;
  const bookingInfo = selectedTrip?.bookingInfo || {};
  const checklistCompletedCount = (selectedTrip?.planningChecklist || []).filter((item) => item.done).length;
  const checklistRemainingCount = Math.max((selectedTrip?.planningChecklist || []).length - checklistCompletedCount, 0);
  const pendingMySavings = Math.max(personalSavingsTarget - personalSavings, 0);
  const tripNextSteps = [
    pendingMySavings > 0 ? `Save $${pendingMySavings} more for your target.` : "Your personal savings target is covered.",
    checklistRemainingCount > 0 ? `${checklistRemainingCount} planning checklist item${checklistRemainingCount === 1 ? "" : "s"} are still open.` : "Your checklist is fully done for now.",
    bookingInfo.hasBookingInfo !== "yes" ? "Add booking details if you want the AI itinerary to use your arrival and stay info." : "Booking details are in place for more accurate itinerary ideas.",
  ];

  const togglePreference = (preference) => {
    setNewTripForm((prev) => ({
      ...prev,
      tripPreferences: prev.tripPreferences.includes(preference)
        ? prev.tripPreferences.filter((item) => item !== preference)
        : [...prev.tripPreferences, preference],
    }));
  };

  const updateTrip = async (updatedTrip) => {
    if (isSupabaseConfigured && effectiveCurrentUserId && updatedTrip?.id && !String(updatedTrip.id).startsWith("trip-")) {
      const { error } = await supabase
        .from("trips")
        .update({
          name: updatedTrip.name,
          destination: updatedTrip.destination,
          start_date: updatedTrip.startDate,
          end_date: updatedTrip.endDate,
          budget: updatedTrip.budget,
          spent: updatedTrip.spent,
          members: updatedTrip.members,
          color: updatedTrip.color,
          status: updatedTrip.status,
          itinerary: updatedTrip.itinerary,
          packing_list: updatedTrip.packingList,
          ratings: updatedTrip.ratings || [],
          savings_progress: updatedTrip.savingsProgress || [],
          planning_checklist: updatedTrip.planningChecklist || [],
          itinerary_suggestions: updatedTrip.itinerarySuggestions || [],
          booking_info: updatedTrip.bookingInfo || {},
          trip_preferences: updatedTrip.tripPreferences || [],
          hidden_for: updatedTrip.hiddenFor || [],
          group_savings_goal: updatedTrip.groupSavingsGoal || 0,
          member_savings_targets: updatedTrip.memberSavingsTargets || [],
        })
        .eq("id", updatedTrip.id);
      if (error) return;
    }
    persistTrips((previousTrips) => previousTrips.map((trip) => (trip.id === updatedTrip.id ? updatedTrip : trip)), updatedTrip.id);
  };

  const togglePackItem = (itemId) => {
    const updated = { ...selectedTrip, packingList: selectedTrip.packingList.map(p => p.id === itemId ? { ...p, packed: !p.packed } : p) };
    void updateTrip(updated);
  };

  const deletePackItem = (itemId) => {
    const updated = { ...selectedTrip, packingList: selectedTrip.packingList.filter(p => p.id !== itemId) };
    void updateTrip(updated);
  };

  const addPackItem = () => {
    if (!newPackItem.trim()) return;
    const updated = { ...selectedTrip, packingList: [...selectedTrip.packingList, { id: Date.now(), item: newPackItem.trim(), packed: false }] };
    void updateTrip(updated);
    setNewPackItem("");
  };

  const addActivity = () => {
    if (!newActivity.time || !newActivity.name.trim()) return;
    const updated = {
      ...selectedTrip,
      itinerary: selectedTrip.itinerary.map(d =>
        d.day === newActivity.day
          ? {
            ...d,
            activities: [...d.activities, {
              id: createId("activity"),
              time: newActivity.time,
              name: newActivity.name.trim(),
              notes: "",
              done: false,
              source: "manual",
            }].sort((a, b) => a.time.localeCompare(b.time)),
          }
          : d
      )
    };
    void updateTrip(updated);
    setNewActivity({ day: newActivity.day, time: "", name: "" });
  };

  const toggleActivityDone = (dayNumber, activityId) => {
    if (!selectedTrip) return;
    const updated = {
      ...selectedTrip,
      itinerary: selectedTrip.itinerary.map((day) => (
        day.day === dayNumber
          ? {
            ...day,
            activities: day.activities.map((activity) => (
              activity.id === activityId
                ? { ...activity, done: !activity.done }
                : activity
            )),
          }
          : day
      )),
    };
    void updateTrip(updated);
  };

  const deleteActivity = (dayNumber, activityId) => {
    if (!selectedTrip) return;
    const updated = {
      ...selectedTrip,
      itinerary: selectedTrip.itinerary.map((day) => (
        day.day === dayNumber
          ? { ...day, activities: day.activities.filter((activity) => activity.id !== activityId) }
          : day
      )),
    };
    void updateTrip(updated);
  };

  const toggleChecklistItem = (itemId) => {
    if (!selectedTrip) return;
    const updated = {
      ...selectedTrip,
      planningChecklist: (selectedTrip.planningChecklist || []).map((item) => (
        item.id === itemId ? { ...item, done: !item.done } : item
      )),
    };
    void updateTrip(updated);
  };

  const updateMySavings = (value) => {
    if (!selectedTrip) return;
    const nextAmount = Math.max(Number(value) || 0, 0);
    const updatedSavings = editableSavingsEntry
      ? (selectedTrip.savingsProgress || []).map((entry) => (
        entry.id === editableSavingsEntry.id
          ? { ...entry, saved: nextAmount }
          : entry
      ))
      : [
        ...(selectedTrip.savingsProgress || []),
        {
          id: createId("saving"),
          userId: effectiveCurrentUserId || null,
          username: currentUsername,
          name: currentUserDisplayName,
          saved: nextAmount,
        },
      ];
    const updated = {
      ...selectedTrip,
      savingsProgress: updatedSavings,
      spent: nextAmount,
    };
    void updateTrip(updated);
  };

  const updateGroupSavingsGoal = (value) => {
    if (!selectedTrip || !isTripHost) return;
    const nextGoal = Math.max(Number(value) || 0, 0);
    const nextTargets = buildMemberSavingsTargets(
      (selectedTrip.savingsProgress || []).map((entry) => ({
        id: entry.id,
        userId: entry.userId,
        username: entry.username,
        name: entry.name,
      })),
      nextGoal
    );
    void updateTrip({
      ...selectedTrip,
      groupSavingsGoal: nextGoal,
      memberSavingsTargets: nextTargets,
    });
  };

  const updateMemberTarget = (targetId, value) => {
    if (!selectedTrip || !isTripHost) return;
    void updateTrip({
      ...selectedTrip,
      memberSavingsTargets: (memberSavingsTargets || []).map((entry) => (
        entry.id === targetId
          ? { ...entry, target: Math.max(Number(value) || 0, 0) }
          : entry
      )),
    });
  };

  const addSuggestionToItinerary = (suggestion) => {
    if (!selectedTrip) return;
    const targetDay = Number(suggestion.day) || 1;
    const updated = {
      ...selectedTrip,
      itinerary: selectedTrip.itinerary.map((day) => (
        day.day === targetDay
          ? {
            ...day,
            activities: [...day.activities, {
              id: createId("activity"),
              time: suggestion.time || "",
              name: suggestion.title || "AI suggestion",
              notes: suggestion.notes || "",
              done: false,
              source: "ai",
              suggestionId: suggestion.id || "",
            }].sort((a, b) => a.time.localeCompare(b.time)),
          }
          : day
      )),
      itinerarySuggestions: (selectedTrip.itinerarySuggestions || []).map((item) => (
        item.id === suggestion.id ? { ...item, added: true } : item
      )),
    };
    void updateTrip(updated);
  };

  const generateSuggestions = async () => {
    if (!selectedTrip) return;
    setIsGeneratingSuggestions(true);
    setAiError("");
    try {
      const suggestions = await requestTripItinerarySuggestions(selectedTrip);
      const updated = {
        ...selectedTrip,
        itinerarySuggestions: suggestions.map((item, index) => ({
          id: item.id || createId(`suggestion-${index}`),
          day: Number(item.day) || 1,
          time: item.time || "",
          title: item.title || "Trip idea",
          notes: item.notes || "",
          category: item.category || "general",
          added: false,
        })),
      };
      await updateTrip(updated);
    } catch (error) {
      setAiError(error.message || "We could not generate itinerary ideas right now.");
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const deleteTrip = async () => {
    if (!selectedTrip) return;
    const isCreator = effectiveCurrentUserId && String(selectedTrip.creatorId || "") === String(effectiveCurrentUserId);
    const isSharedTrip = Boolean(selectedTrip.groupId);

    if (isCreator && isSharedTrip) {
      const choice = window.prompt(
        `Type "me" to remove ${selectedTrip.name} only for yourself, or type "team" to delete it for everyone.`
      );
      if (!choice) return;

      if (choice.trim().toLowerCase() === "team") {
        const confirmed = window.confirm(`Delete ${selectedTrip.name} for the whole team?`);
        if (!confirmed) return;
        if (isSupabaseConfigured && effectiveCurrentUserId && selectedTrip?.id && !String(selectedTrip.id).startsWith("trip-")) {
          const { error } = await supabase.from("trips").delete().eq("id", selectedTrip.id);
          if (error) return;
        }
        persistTrips((previousTrips) => previousTrips.filter((trip) => trip.id !== selectedTrip.id), null);
      } else if (choice.trim().toLowerCase() === "me") {
        const nextHiddenFor = Array.from(new Set([...(selectedTrip.hiddenFor || []), effectiveCurrentUserId]));
        const updatedTrip = { ...selectedTrip, hiddenFor: nextHiddenFor };
        await updateTrip(updatedTrip);
        persistTrips((previousTrips) => previousTrips.filter((trip) => trip.id !== selectedTrip.id), null);
      }
    } else {
      const confirmed = window.confirm(`Remove ${selectedTrip.name} from your trip list?`);
      if (!confirmed) return;
      if (isCreator && !isSharedTrip) {
        if (isSupabaseConfigured && effectiveCurrentUserId && selectedTrip?.id && !String(selectedTrip.id).startsWith("trip-")) {
          const { error } = await supabase.from("trips").delete().eq("id", selectedTrip.id);
          if (error) return;
        }
      } else {
        const nextHiddenFor = Array.from(new Set([...(selectedTrip.hiddenFor || []), effectiveCurrentUserId]));
        const updatedTrip = { ...selectedTrip, hiddenFor: nextHiddenFor };
        await updateTrip(updatedTrip);
      }
      persistTrips((previousTrips) => previousTrips.filter((trip) => trip.id !== selectedTrip.id), null);
    }
    setActiveTab("Overview");
  };

  const createTrip = async () => {
    if (!newTripForm.name.trim() || !newTripForm.destination.trim() || !newTripForm.startDate || !newTripForm.endDate) {
      setFormError("Fill in all required fields!");
      return;
    }
    if (new Date(newTripForm.endDate) < new Date(newTripForm.startDate)) {
      setFormError("End date has to be after the start date.");
      return;
    }
    const days = getDays(newTripForm.startDate, newTripForm.endDate);
    const selectedGroup = groups.find((group) => String(group.id) === String(newTripForm.groupId)) || null;
    const resolvedGroupMembers = (selectedGroup?.members || []).map((member) => ({
      userId: member.userId || null,
      username: member.username || "",
      name: member.name || member.username || "Crew",
      email: member.email || "",
    }));
    const itinerary = Array.from({ length: days }, (_, i) => ({
      day: i + 1,
      date: formatDate(new Date(new Date(newTripForm.startDate).getTime() + i * 86400000).toISOString().split("T")[0]),
      activities: [],
    }));
    const newTrip = {
      id: `trip-${Date.now()}`,
      name: newTripForm.name,
      destination: newTripForm.destination,
      startDate: newTripForm.startDate,
      endDate: newTripForm.endDate,
      budget: Number(newTripForm.budget) || 0,
      spent: 0,
      members: selectedGroup
        ? selectedGroup.members.map((member) => member.name || member.username || "Crew")
        : [String(appData?.profile?.name || appData?.profile?.username || "YOU").slice(0, 3).toUpperCase()],
      color: TRIP_COLORS[trips.length % TRIP_COLORS.length],
      status: "Planning",
      itinerary,
      packingList: [{ id: 1, item: "Passport / ID 🛂", packed: false }, { id: 2, item: "Phone charger 🔋", packed: false }],
      ratings: [],
      groupId: selectedGroup?.id || null,
      savingsProgress: buildSavingsProgress(
        selectedGroup ? resolvedGroupMembers : [],
        currentProfile,
        effectiveCurrentUserId
      ),
      planningChecklist: buildDefaultChecklist(),
      itinerarySuggestions: [],
      bookingInfo: {
        ...getDefaultBookingInfo(),
        ...(newTripForm.bookingInfo || {}),
      },
      tripPreferences: newTripForm.tripPreferences || [],
      hiddenFor: [],
      groupSavingsGoal: Number(newTripForm.budget) || 0,
      memberSavingsTargets: buildMemberSavingsTargets(
        selectedGroup ? resolvedGroupMembers : [{
          userId: effectiveCurrentUserId || null,
          username: currentProfile?.username ? `@${String(currentProfile.username).replace(/^@/, "")}` : "",
          name: currentUserDisplayName,
        }],
        Number(newTripForm.budget) || 0
      ),
    };
    let savedTrip = {
      ...newTrip,
      creatorId: effectiveCurrentUserId || null,
    };
    if (isSupabaseConfigured && effectiveCurrentUserId) {
      const { data, error } = await supabase
        .from("trips")
        .insert({
          name: newTrip.name,
          destination: newTrip.destination,
          start_date: newTrip.startDate,
          end_date: newTrip.endDate,
          budget: newTrip.budget,
          spent: newTrip.spent,
          members: newTrip.members,
          color: newTrip.color,
          status: newTrip.status,
          itinerary: newTrip.itinerary,
          packing_list: newTrip.packingList,
          ratings: [],
          creator_id: effectiveCurrentUserId,
          group_id: newTrip.groupId,
          savings_progress: newTrip.savingsProgress,
          planning_checklist: newTrip.planningChecklist,
          itinerary_suggestions: [],
          booking_info: newTrip.bookingInfo,
          trip_preferences: newTrip.tripPreferences,
          hidden_for: [],
          group_savings_goal: newTrip.groupSavingsGoal,
          member_savings_targets: newTrip.memberSavingsTargets,
        })
        .select("*")
        .single();
      if (!error && data) {
        savedTrip = {
          ...savedTrip,
          id: data.id,
          startDate: data.start_date,
          endDate: data.end_date,
          packingList: data.packing_list || newTrip.packingList,
          creatorId: data.creator_id,
          groupId: data.group_id || newTrip.groupId,
          savingsProgress: data.savings_progress || newTrip.savingsProgress,
          planningChecklist: data.planning_checklist || newTrip.planningChecklist,
          itinerarySuggestions: data.itinerary_suggestions || [],
          bookingInfo: data.booking_info || newTrip.bookingInfo,
          tripPreferences: data.trip_preferences || newTrip.tripPreferences,
          hiddenFor: data.hidden_for || [],
          groupSavingsGoal: Number(data.group_savings_goal) || newTrip.groupSavingsGoal,
          memberSavingsTargets: data.member_savings_targets || newTrip.memberSavingsTargets,
        };
      } else if (error) {
        setFormError(error.message || "We could not save this trip right now.");
        return;
      }

      if (selectedGroup) {
        const usernamesToResolve = (selectedGroup.members || [])
          .filter((member) => member.username)
          .map((member) => String(member.username).replace(/^@/, "").toLowerCase());
        const { data: profileMatches } = usernamesToResolve.length
          ? await supabase.from("profiles").select("id, username, email, full_name").in("username", usernamesToResolve)
          : { data: [] };
        const profileByUsername = new Map((profileMatches || []).map((item) => [String(item.username || "").toLowerCase(), item]));
        const resolvedMembers = (selectedGroup.members || []).map((member) => {
          const normalizedUsername = String(member.username || "").replace(/^@/, "").toLowerCase();
          const match = profileByUsername.get(normalizedUsername);
          return {
            ...member,
            userId: member.userId || match?.id || null,
            email: member.email || match?.email || "",
            name: member.name || match?.full_name || member.name,
          };
        });
        const recipientRows = resolvedMembers
          .filter((member) => member.userId)
          .map((member) => ({
            user_id: member.userId,
            recipient: member.name,
            recipient_key: `user:${member.userId}`,
            group_id: selectedGroup.id,
            group_name: selectedGroup.name,
            action_screen: "trip-planning",
            action_params: { tripId: savedTrip.id },
            type: "trip-created",
            message: `${getDisplayName(appData?.profile || {})} created a trip: ${savedTrip.name}.`,
            read: false,
          }));

        if (recipientRows.length) {
          await supabase.from("notifications").insert(recipientRows);
        }

        try {
          await sendNotificationEmails({
            recipients: resolvedMembers
              .filter((member) => member.email)
              .map((member) => ({ email: member.email, name: member.name })),
            subject: `${getDisplayName(appData?.profile || {})} created a trip in ${selectedGroup.name}`,
            intro: `${getDisplayName(appData?.profile || {})} just planned "${savedTrip.name}" for ${selectedGroup.name}.`,
            ctaLabel: "Open trip",
            ctaUrl: buildAppUrl("trip-planning", { tripId: savedTrip.id }),
            details: [
              `Destination: ${savedTrip.destination}`,
              `Dates: ${savedTrip.startDate} to ${savedTrip.endDate}`,
            ],
            excludeEmails: [appData?.profile?.email],
          });
        } catch (emailError) {
          console.warn("Trip email notifications did not fully send:", emailError.message);
        }
      }
    }
    persistTrips((previousTrips) => [...previousTrips, savedTrip], savedTrip.id);
    if (selectedGroup) {
      setAppData?.((prev) => ({
        ...prev,
        notifications: [
          ...(prev.notifications || []),
          {
            id: createId("note"),
            type: "trip-created",
            message: `${getDisplayName(appData?.profile || {})} created a trip: ${savedTrip.name}.`,
            groupId: selectedGroup.id,
            groupName: selectedGroup.name,
            actionScreen: "trip-planning",
            actionParams: { tripId: savedTrip.id },
            createdAt: new Date().toISOString(),
            read: false,
          },
        ],
      }));
    }
    setShowCreateModal(false);
    setNewTripForm({
      name: "",
      destination: "",
      startDate: "",
      endDate: "",
      budget: "",
      groupId: "",
      tripPreferences: [],
      bookingInfo: getDefaultBookingInfo(),
    });
    setFormError("");
    setActiveTab("Overview");
  };

  const packedCount = selectedTrip?.packingList.filter(p => p.packed).length || 0;
  const totalPack = selectedTrip?.packingList.length || 0;
  const budgetPct = personalSavingsTarget ? savingsPct : 0;
  const budgetColor = budgetPct >= 100 ? "#51cf66" : budgetPct > 65 ? "#4ecdc4" : "#ff9a3c";
  const profileName = appData?.profile?.name || appData?.profile?.username || "You";

  return (
    <>
      <style>{STYLES}</style>
      <div className="root">

        <OutsidersSideNav activeLabel="Trips" onNavigate={onNavigate} profileName={profileName} notificationCount={(appData?.notifications || []).filter((n) => !n.read).length} appData={appData} setAppData={setAppData}>
          <main className="main">
            <section className="trip-planning-shell">
              <div className="trip-hero">
                <div className="trip-kicker">
                  <span>⚡</span>
                  <span>Adventure Awaits!</span>
                  <span>⚡</span>
                </div>
                <h1 className="trip-title">
                  Trip Planning
                  <span className="trip-title-plane">✈️</span>
                </h1>
                <div className="trip-actions-row">
                  <div className="speech-pill">Plan your next crew adventure.</div>
                  <button className="btn-primary trip-new-btn" onClick={() => setShowCreateModal(true)}>
                    <IconPlus /> New Trip
                  </button>
                </div>
              </div>

              <div className="trip-section-label">Your Trips</div>

              {trips.length === 0 ? (
                <div className="trip-empty-panel">
                  <div className="trip-empty-content">
                    <div className="trip-stamp">📍 Blank Map!</div>
                    <h2 className="trip-empty-title">No Trips Yet</h2>
                    <p className="trip-empty-copy">
                      Plan your first trip when you&apos;re ready.
                      <br />
                      The world won&apos;t explore itself!
                    </p>
                    <button className="btn-primary trip-new-btn" onClick={() => setShowCreateModal(true)}>
                      <IconPlus /> Plan New Trip
                    </button>
                  </div>
                </div>
              ) : (
                <div className="trip-detail-layout">
                  <div className="trip-column-card">
                    <div className="trip-column-title">
                      <div>
                        <p className="bangers" style={{ fontSize: 22, margin: 0, color: "#1a1a2e" }}>Trip Lineup</p>
                        <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 800, color: "#7b7e87" }}>Pick a trip to open its planner.</p>
                      </div>
                      <span className="trip-count-badge">{trips.length}</span>
                    </div>
                    <div className="trip-list-stack">
                      {trips.map((trip) => (
                        <div
                          key={trip.id}
                          className={`trip-card ${selectedTrip?.id === trip.id ? "active" : ""}`}
                          style={{ background: trip.color.bg, borderColor: selectedTrip?.id === trip.id ? "#ff6b6b" : trip.color.border, boxShadow: `5px 5px 0 ${selectedTrip?.id === trip.id ? "#ff6b6b" : trip.color.border}` }}
                          onClick={() => { setSelectedTripId(trip.id); setActiveTab("Overview"); }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                            <div style={{ width: 44, height: 44, background: "#fff", border: `3px solid ${trip.color.border}`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: `3px 3px 0 ${trip.color.border}`, flexShrink: 0 }}>
                              {trip.color.emoji}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <p className="bangers" style={{ fontSize: 16, margin: 0, color: "#1a1a2e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{trip.name}</p>
                              <p style={{ fontSize: 12, fontWeight: 700, color: "#888", margin: 0 }}>📍 {trip.destination}</p>
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 12, fontWeight: 800, color: "#666" }}>
                              {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
                            </span>
                            <span className="badge" style={{
                              background: trip.status === "Planning" ? "#e8f4fd" : "#f3e8fd",
                              color: trip.status === "Planning" ? "#4ecdc4" : "#9b59b6",
                              borderColor: trip.status === "Planning" ? "#4ecdc4" : "#9b59b6",
                            }}>{trip.status}</span>
                          </div>
                        </div>
                      ))}

                      <div
                        onClick={() => setShowCreateModal(true)}
                        style={{ border: "3px dashed #b9b1a2", borderRadius: 18, padding: "18px 16px", textAlign: "center", cursor: "pointer", transition: "border-color 0.2s, transform 0.2s", background: "rgba(255,255,255,0.68)" }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = "#ff6b6b";
                          e.currentTarget.style.transform = "translate(-2px, -2px)";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = "#b9b1a2";
                          e.currentTarget.style.transform = "translate(0, 0)";
                        }}
                      >
                        <p className="bangers" style={{ fontSize: 15, color: "#888", margin: 0 }}>+ Plan New Trip</p>
                      </div>
                    </div>
                  </div>
                  
                  {selectedTrip && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                        <div>
                          <p className="bangers" style={{ fontSize: 26, margin: 0, color: "#1a1a2e" }}>Selected Trip</p>
                          <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 800, color: "#7b7e87" }}>Overview, itinerary, and packing in one place.</p>
                        </div>
                        <span className="badge" style={{ background: "#fff", color: "#1a1a2e", borderColor: "#1a1a2e" }}>{selectedTrip.status}</span>
                      </div>

                  {/* Trip header */}
                  <div className="card" style={{ background: selectedTrip.color.bg, borderColor: selectedTrip.color.border, boxShadow: `5px 5px 0 ${selectedTrip.color.border}` }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                      <div>
                        <h2 className="bangers" style={{ fontSize: 28, margin: "0 0 6px", color: "#1a1a2e" }}>{selectedTrip.name}</h2>
                        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 13, fontWeight: 800, color: "#555" }}>📍 {selectedTrip.destination}</span>
                          <span style={{ fontSize: 13, fontWeight: 800, color: "#555" }}>📅 {formatDate(selectedTrip.startDate)} – {formatDate(selectedTrip.endDate)}</span>
                          <span style={{ fontSize: 13, fontWeight: 800, color: "#555" }}>🌙 {getDays(selectedTrip.startDate, selectedTrip.endDate)} days</span>
                          {selectedTripGroup ? <span style={{ fontSize: 13, fontWeight: 800, color: "#555" }}>{selectedTripGroup.emoji} {selectedTripGroup.name}</span> : null}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: -8 }}>
                        {selectedTrip.members.map((m, i) => (
                          <div key={m} className="avatar-sm" style={{ background: AVATAR_COLORS[i], marginLeft: i > 0 ? -10 : 0, border: "2px solid #fff", width: 32, height: 32, fontSize: 11 }}>{m}</div>
                        ))}
                        <span style={{ fontSize: 12, fontWeight: 800, color: "#888", marginLeft: 10 }}>{selectedTrip.members.length} going</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
                      <button type="button" className="btn-danger" onClick={() => void deleteTrip()}>Delete trip</button>
                    </div>

                    {/* Budget bar */}
                    {selectedTrip.budget > 0 && (
                      <div style={{ marginTop: 16 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span className="bangers" style={{ fontSize: 14, color: "#1a1a2e" }}>💸 Your savings progress</span>
                          <span style={{ fontSize: 13, fontWeight: 800, color: budgetColor }}>${personalSavings} saved / ${personalSavingsTarget} target</span>
                        </div>
                        <div className="budget-bar">
                          <div className="budget-fill" style={{ width: `${budgetPct}%`, background: budgetColor }} />
                        </div>
                        <p style={{ margin: "10px 0 0", fontSize: 12, fontWeight: 800, color: "#666" }}>
                          ${remainingToSave} left for your share of this trip.
                        </p>
                      </div>
                    )}

                    <div style={{ marginTop: 16, display: "grid", gap: 10, background: "rgba(255,255,255,0.72)", border: "2px dashed rgba(26,26,46,0.22)", borderRadius: 16, padding: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                        <div>
                          <p className="bangers" style={{ fontSize: 16, margin: 0, color: "#1a1a2e" }}>{selectedTripGroup ? "Crew trip space" : "Personal trip space"}</p>
                          <p style={{ margin: "4px 0 0", fontSize: 12, fontWeight: 800, color: "#666" }}>
                            {selectedTripGroup
                              ? "Trip plans stay here for the crew, so there is no extra code or share link to manage."
                              : "This trip stays just for you for now, so there is no code or share link attached to it."}
                          </p>
                        </div>
                      </div>
                      <div className="invite-value">
                        {selectedTripGroup
                          ? "Open this trip from the Trip Planning page whenever the crew wants to review dates, savings, bookings, or the itinerary."
                          : "Open this trip from the Trip Planning page whenever you want to review dates, savings, bookings, or the itinerary."}
                      </div>
                    </div>

                    <div style={{ marginTop: 16, display: "grid", gap: 10, background: "rgba(255,255,255,0.72)", border: "2px dashed rgba(26,26,46,0.22)", borderRadius: 16, padding: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                        <div>
                          <p className="bangers" style={{ fontSize: 16, margin: 0, color: "#1a1a2e" }}>Search or book on Trip.com</p>
                          <p style={{ margin: "4px 0 0", fontSize: 12, fontWeight: 800, color: "#666" }}>
                            Search stays, flights, or packages using this trip as your starting point.
                          </p>
                        </div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <a className="btn-secondary" href={tripComHotelsLink} target="_blank" rel="noreferrer">Search hotels</a>
                          <a className="btn-secondary" href={tripComFlightsLink} target="_blank" rel="noreferrer">Search flights</a>
                          <a className="btn-secondary" href={tripComPackagesLink} target="_blank" rel="noreferrer">Book package</a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div style={{ display: "flex", gap: 8, background: "#f5f3ee", padding: 6, borderRadius: 12, border: "3px solid #1a1a2e", width: "fit-content", boxShadow: "3px 3px 0 #1a1a2e" }}>
                    {["Overview", "Itinerary", "Packing List"].map(t => (
                      <button key={t} className={`tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>{t}</button>
                    ))}
                  </div>

                  {/* Overview */}
                  {activeTab === "Overview" && (
                    <div className="card" style={{ display: "grid", gap: 20 }}>
                      <div className="trip-overview-grid" style={{ display: "grid", gap: 16 }}>
                        {[
                          { label: "Days", value: getDays(selectedTrip.startDate, selectedTrip.endDate), emoji: "🌙", color: "#4ecdc4", bg: "#e8f4fd", border: "#4ecdc4" },
                          { label: "Going", value: selectedTrip.members.length, emoji: "👥", color: "#51cf66", bg: "#e8fde8", border: "#51cf66" },
                          { label: "Group Goal Left", value: `$${Math.max(groupSavingsGoal - totalGroupSaved, 0)}`, emoji: "🏦", color: "#ff9a3c", bg: "#fff4e6", border: "#ff9a3c" },
                          { label: "Packed", value: `${packedCount}/${totalPack}`, emoji: "🎒", color: "#a29bfe", bg: "#f3e8fd", border: "#9b59b6" },
                        ].map(s => (
                          <div key={s.label} style={{ background: s.bg, border: `3px solid ${s.border}`, borderRadius: 14, padding: "18px 20px", boxShadow: `4px 4px 0 ${s.border}` }}>
                            <p style={{ fontSize: 13, fontWeight: 800, color: "#888", margin: "0 0 6px" }}>{s.emoji} {s.label}</p>
                            <p className="bangers" style={{ fontSize: 32, margin: 0, color: s.color }}>{s.value}</p>
                          </div>
                        ))}
                      </div>

                      <details className="collapsible-block" open>
                        <summary>
                          <span>My Part</span>
                          <span className="badge" style={{ background: "#eef8ff", color: "#155eef", borderColor: "#155eef" }}>{currentUserDisplayName}</span>
                        </summary>
                        <div className="collapsible-content">
                          <div style={{ display: "grid", gap: 10 }}>
                            <div style={{ display: "grid", gap: 8, padding: 14, borderRadius: 14, border: "2px solid #e5dcc6", background: "#fffdf7" }}>
                              <strong>Your role in this trip</strong>
                              <p style={{ margin: 0, color: "#666", fontWeight: 800 }}>
                                {isTripHost
                                  ? "You are the trip host, so you can guide the group goal and each person’s target."
                                  : "You are part of the shared trip, with your own savings and checklist inside the crew plan."}
                              </p>
                            </div>
                            <div style={{ display: "grid", gap: 8, padding: 14, borderRadius: 14, border: "2px solid #e5dcc6", background: "#fffdf7" }}>
                              <strong>What needs you next</strong>
                              {tripNextSteps.map((step) => (
                                <div key={step} style={{ color: "#555", fontWeight: 800 }}>{step}</div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </details>

                      <details className="collapsible-block" open>
                        <summary>
                          <span>Group Savings</span>
                          <span className="badge" style={{ background: "#fff4e6", color: "#ff9a3c", borderColor: "#ff9a3c" }}>${totalGroupSaved} saved</span>
                        </summary>
                        <div className="collapsible-content">
                          <p style={{ margin: 0, color: "#666", fontWeight: 800 }}>
                            The trip host sets the full savings goal here and can guide what each person should aim for.
                          </p>
                          <div style={{ display: "grid", gap: 12, padding: 14, borderRadius: 14, border: "2px solid #e5dcc6", background: "#fffdf7" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                              <strong>Whole trip goal</strong>
                              <span style={{ fontWeight: 900, color: "#666" }}>${groupSavingsGoal}</span>
                            </div>
                            <input
                              className="form-input"
                              type="number"
                              min="0"
                              disabled={!isTripHost}
                              value={groupSavingsGoal}
                              onChange={(event) => updateGroupSavingsGoal(event.target.value)}
                              placeholder="Set the total group goal"
                            />
                            {!isTripHost ? <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#888" }}>Only the trip host can edit the overall group goal.</p> : null}
                          </div>
                          <div style={{ display: "grid", gap: 10 }}>
                            {memberSavingsTargets.map((entry) => {
                              const saved = (selectedTrip.savingsProgress || []).find((item) => item.id === entry.id || item.userId === entry.userId || item.username === entry.username || item.name === entry.name);
                              return (
                                <div key={entry.id} style={{ display: "grid", gap: 8, padding: 14, borderRadius: 14, border: "2px solid #e5dcc6", background: "#fffdf7" }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                                    <strong>{entry.name}</strong>
                                    <span style={{ fontWeight: 900, color: "#666" }}>${Number(saved?.saved) || 0} saved</span>
                                  </div>
                                  <input
                                    className="form-input"
                                    type="number"
                                    min="0"
                                    disabled={!isTripHost}
                                    value={Number(entry.target) || 0}
                                    onChange={(event) => updateMemberTarget(entry.id, event.target.value)}
                                    placeholder="Target for this person"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </details>

                      <details className="collapsible-block" open>
                        <summary>
                          <span>My Savings</span>
                          <span className="badge" style={{ background: "#fff4e6", color: "#ff9a3c", borderColor: "#ff9a3c" }}>${personalSavings} saved</span>
                        </summary>
                        <div className="collapsible-content">
                          <p style={{ margin: 0, color: "#666", fontWeight: 800 }}>
                            This is your own savings tracker for this trip.
                          </p>
                          <div style={{ display: "grid", gap: 12, padding: 14, borderRadius: 14, border: "2px solid #e5dcc6", background: "#fffdf7" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                              <strong>{currentUserDisplayName}</strong>
                              <span style={{ fontWeight: 900, color: "#666" }}>${personalSavings} saved</span>
                            </div>
                            <input className="form-input" type="number" min="0" value={personalSavings} onChange={(event) => updateMySavings(event.target.value)} placeholder="How much have you saved?" />
                            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#888" }}>
                              Your target: ${memberSavingsTargets.find((item) => item.name === currentUserDisplayName || item.userId === effectiveCurrentUserId || item.username === currentUsername)?.target ?? personalSavingsTarget}
                            </p>
                          </div>
                        </div>
                      </details>

                      <details className="collapsible-block" open>
                        <summary>
                          <span>Booking Details</span>
                          <span className="badge" style={{ background: "#e8f4fd", color: "#155eef", borderColor: "#155eef" }}>{bookingInfo.hasBookingInfo === "yes" ? "Saved" : "Planning"}</span>
                        </summary>
                        <div className="collapsible-content">
                          <p style={{ margin: 0, color: "#666", fontWeight: 800 }}>
                            {bookingInfo.hasBookingInfo === "yes"
                              ? "Your itinerary can use your arrival, stay, and layover details."
                              : "If you add booking details later, regenerate the itinerary to make it more exact."}
                          </p>
                          <div style={{ display: "grid", gap: 8 }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: "#555" }}>Arrival city: {bookingInfo.arrivalCity || "Not added yet"}</div>
                            <div style={{ fontSize: 13, fontWeight: 800, color: "#555" }}>Arrival time: {bookingInfo.arrivalDate || bookingInfo.arrivalTime ? `${bookingInfo.arrivalDate || "Date TBD"} ${bookingInfo.arrivalTime || ""}`.trim() : "Not added yet"}</div>
                            <div style={{ fontSize: 13, fontWeight: 800, color: "#555" }}>Stay: {bookingInfo.stayName || bookingInfo.stayArea || "Not added yet"}</div>
                            <div style={{ fontSize: 13, fontWeight: 800, color: "#555" }}>Interests: {(selectedTrip.tripPreferences || []).length ? selectedTrip.tripPreferences.join(", ") : "Pick interests in the trip setup modal for more tailored itinerary ideas."}</div>
                          </div>
                        </div>
                      </details>

                      <details className="collapsible-block" open>
                        <summary>
                          <span>My Checklist</span>
                          <span className="badge" style={{ background: "#eefdf5", color: "#0f766e", borderColor: "#0f766e" }}>
                            {(selectedTrip.planningChecklist || []).filter((item) => item.done).length}/{(selectedTrip.planningChecklist || []).length}
                          </span>
                        </summary>
                        <div className="collapsible-content">
                          <div style={{ display: "grid", gap: 10 }}>
                            {(selectedTrip.planningChecklist || []).map((item) => (
                              <div key={item.id} className="pack-item" onClick={() => toggleChecklistItem(item.id)}>
                                <div className="checkbox" style={{ background: item.done ? "#51cf66" : "#fff", borderColor: item.done ? "#51cf66" : "#1a1a2e" }}>
                                  {item.done && <IconCheck />}
                                </div>
                                <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: item.done ? "#888" : "#1a1a2e", textDecoration: item.done ? "line-through" : "none" }}>
                                  {item.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </details>
                    </div>
                  )}

                  {/* Itinerary */}
                  {activeTab === "Itinerary" && (
                    <div className="card">
                      <div className="section-header">
                        <h3 className="bangers" style={{ fontSize: 20, margin: 0 }}>📅 Day by Day Plan</h3>
                        <button type="button" className="btn-secondary" onClick={() => void generateSuggestions()} disabled={isGeneratingSuggestions}>
                          {isGeneratingSuggestions ? "Building ideas..." : "AI build itinerary ideas"}
                        </button>
                      </div>
                      <p style={{ margin: "0 0 16px", color: "#666", fontWeight: 800 }}>
                        Add your own plan, then pull in AI suggestions and check things off as your crew does them.
                      </p>
                      <div className="itinerary-workspace">
                        <div style={{ display: "grid", gap: 12 }}>
                          <div className="trip-section-box">
                            <strong className="bangers" style={{ fontSize: 18 }}>AI Suggestions</strong>
                            <p style={{ margin: 0, color: "#666", fontWeight: 800 }}>
                              These stay separate from your final itinerary until you choose to add them.
                            </p>
                          </div>
                          {aiError ? <p style={{ margin: 0, color: "#b42318", fontWeight: 800 }}>{aiError}</p> : null}
                          {(selectedTrip.itinerarySuggestions || []).length ? (
                            <div style={{ display: "grid", gap: 12 }}>
                              {(selectedTrip.itinerarySuggestions || []).map((suggestion) => (
                                <div key={suggestion.id} style={{ border: "2px solid #e7dcc5", borderRadius: 16, background: "#fffdf7", padding: 14, display: "grid", gap: 8 }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                                    <strong>Day {suggestion.day} · {suggestion.time || "Flexible time"}</strong>
                                    <span className="badge" style={{ background: suggestion.added ? "#eefdf5" : "#fff4e6", color: suggestion.added ? "#0f766e" : "#b54708", borderColor: suggestion.added ? "#0f766e" : "#f79009" }}>
                                      {suggestion.added ? "Added" : (suggestion.category || "Idea")}
                                    </span>
                                  </div>
                                  <div className="bangers" style={{ fontSize: 19, color: "#1a1a2e" }}>{suggestion.title}</div>
                                  <p style={{ margin: 0, color: "#666", fontWeight: 700 }}>{suggestion.notes}</p>
                                  <div>
                                    <button type="button" className="btn-secondary" disabled={suggestion.added} onClick={() => addSuggestionToItinerary(suggestion)}>
                                      {suggestion.added ? "Added to itinerary" : "Add this plan"}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div style={{ border: "2px dashed #d8ccb6", borderRadius: 16, background: "#fffdf7", padding: 16, color: "#666", fontWeight: 800 }}>
                              Ask the AI planner for starter ideas and then keep only the ones you want.
                            </div>
                          )}
                        </div>

                        <div style={{ display: "grid", gap: 14 }}>
                          <div className="trip-section-box">
                            <strong className="bangers" style={{ fontSize: 18 }}>Shared Final Itinerary</strong>
                            <p style={{ margin: 0, color: "#666", fontWeight: 800 }}>
                              This is the shared trip plan your group is keeping. Manual items and chosen AI ideas end up here for everyone.
                            </p>
                          </div>
                          {selectedTrip.itinerary.map((day) => (
                            <div key={day.day} className="day-card">
                              <p className="bangers" style={{ fontSize: 17, margin: "0 0 10px", color: "#1a1a2e" }}>Day {day.day} — {day.date}</p>
                              {day.activities.length === 0 && (
                                <p style={{ fontSize: 13, fontWeight: 700, color: "#ccc", margin: "0 0 8px" }}>Nothing planned yet — add something!</p>
                              )}
                              {day.activities.map((a, i) => (
                                <div key={a.id || `${a.time}-${a.name}-${i}`} className="activity-row">
                                  <button
                                    type="button"
                                    className="checkbox"
                                    style={{ background: a.done ? "#51cf66" : "#fff", borderColor: a.done ? "#51cf66" : "#1a1a2e" }}
                                    onClick={() => toggleActivityDone(day.day, a.id)}
                                  >
                                    {a.done ? <IconCheck /> : null}
                                  </button>
                                  <span style={{ fontSize: 12, fontWeight: 900, color: "#aaa", minWidth: 60 }}>{a.time}</span>
                                  <div style={{ width: 8, height: 8, background: selectedTrip.color.border, borderRadius: "50%", border: "2px solid #1a1a2e", flexShrink: 0 }} />
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 14, fontWeight: 700, textDecoration: a.done ? "line-through" : "none", color: a.done ? "#999" : "#1a1a2e" }}>{a.name}</div>
                                    {a.notes ? <div style={{ fontSize: 12, color: "#777", marginTop: 2 }}>{a.notes}</div> : null}
                                  </div>
                                  <button type="button" className="btn-danger" style={{ padding: "4px 8px" }} onClick={() => deleteActivity(day.day, a.id)}>
                                    <IconTrash />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ))}

                          <div style={{ background: "#fffdf9", border: "3px dashed #ccc", borderRadius: 12, padding: "16px" }}>
                            <p className="bangers" style={{ fontSize: 15, margin: "0 0 12px" }}>+ Add Activity</p>
                            <div className="trip-activity-grid" style={{ display: "grid", gap: 10, alignItems: "end" }}>
                              <div>
                                <label className="form-label">Day</label>
                                <select className="form-input" value={newActivity.day} onChange={e => setNewActivity(p => ({ ...p, day: Number(e.target.value) }))} style={{ padding: "10px 12px" }}>
                                  {selectedTrip.itinerary.map(d => <option key={d.day} value={d.day}>Day {d.day}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className="form-label">Time</label>
                                <input className="form-input" type="time" value={newActivity.time} onChange={e => setNewActivity(p => ({ ...p, time: e.target.value }))} />
                              </div>
                              <div>
                                <label className="form-label">Activity</label>
                                <input className="form-input" type="text" placeholder="e.g. Temple visit or food street run" value={newActivity.name} onChange={e => setNewActivity(p => ({ ...p, name: e.target.value }))} onKeyDown={e => e.key === "Enter" && addActivity()} />
                              </div>
                              <button className="btn-secondary" onClick={addActivity} style={{ marginBottom: 0 }}>Add</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Packing List */}
                  {activeTab === "Packing List" && (
                    <div className="card">
                      <div className="section-header">
                        <h3 className="bangers" style={{ fontSize: 20, margin: 0 }}>🎒 Packing List</h3>
                        <span className="badge" style={{ background: packedCount === totalPack && totalPack > 0 ? "#e8fde8" : "#fff4e6", color: packedCount === totalPack && totalPack > 0 ? "#51cf66" : "#ff9a3c", borderColor: packedCount === totalPack && totalPack > 0 ? "#51cf66" : "#ff9a3c" }}>
                          {packedCount}/{totalPack} packed
                        </span>
                      </div>

                      {/* Progress */}
                      <div className="budget-bar" style={{ marginBottom: 18 }}>
                        <div className="budget-fill" style={{ width: totalPack > 0 ? `${Math.round((packedCount / totalPack) * 100)}%` : "0%", background: "#51cf66" }} />
                      </div>

                      {selectedTrip.packingList.map((p) => (
                        <div key={p.id} className="pack-item" onClick={() => togglePackItem(p.id)}>
                          <div className="checkbox" style={{ background: p.packed ? "#51cf66" : "#fff", borderColor: p.packed ? "#51cf66" : "#1a1a2e" }}>
                            {p.packed && <IconCheck />}
                          </div>
                          <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: p.packed ? "#aaa" : "#1a1a2e", textDecoration: p.packed ? "line-through" : "none" }}>{p.item}</span>
                          <button className="btn-danger" style={{ padding: "4px 8px" }} onClick={e => { e.stopPropagation(); deletePackItem(p.id); }}>
                            <IconTrash />
                          </button>
                        </div>
                      ))}

                      {/* Add item */}
                      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                        <input className="form-input" type="text" placeholder="Add a packing item..." value={newPackItem} onChange={e => setNewPackItem(e.target.value)} onKeyDown={e => e.key === "Enter" && addPackItem()} style={{ flex: 1 }} />
                        <button className="btn-secondary" onClick={addPackItem}>Add</button>
                      </div>
                    </div>
                  )}
                    </div>
                  )}
                </div>
              )}
            </section>
          </main>
        </OutsidersSideNav>

        {/* Create Trip Modal */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>✕</button>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <span className="comic-tag">Let's go! ✈️</span>
                <h2 className="bangers" style={{ fontSize: 32, margin: "8px 0 4px" }}>Plan A Trip</h2>
                <p style={{ fontSize: 14, color: "#888", fontWeight: 700, margin: 0 }}>Where is the crew headed?</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="trip-section-box">
                  <label className="form-label">1. Trip basics</label>
                  <div>
                    <label className="form-label">Crew</label>
                    <select className="form-input" value={newTripForm.groupId} onChange={e => setNewTripForm(p => ({ ...p, groupId: e.target.value }))} style={{ padding: "10px 12px" }}>
                      <option value="">Just me for now</option>
                      {groups.map((group) => <option key={group.id} value={group.id}>{group.emoji} {group.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Trip Name *</label>
                    <input className="form-input" type="text" placeholder="e.g. Guangzhou Food Trip" value={newTripForm.name} onChange={e => setNewTripForm(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="form-label">Destination *</label>
                    <input className="form-input" type="text" placeholder="e.g. Guangzhou, Guangdong, China" value={newTripForm.destination} onChange={e => setNewTripForm(p => ({ ...p, destination: e.target.value }))} />
                  </div>
                  <div className="trip-modal-grid" style={{ display: "grid", gap: 14 }}>
                    <div>
                      <label className="form-label">Start Date *</label>
                      <input className="form-input" type="date" value={newTripForm.startDate} onChange={e => setNewTripForm(p => ({ ...p, startDate: e.target.value }))} />
                    </div>
                    <div>
                      <label className="form-label">End Date *</label>
                      <input className="form-input" type="date" value={newTripForm.endDate} onChange={e => setNewTripForm(p => ({ ...p, endDate: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Total Budget ($)</label>
                    <input className="form-input" type="number" placeholder="e.g. 1500" value={newTripForm.budget} onChange={e => setNewTripForm(p => ({ ...p, budget: e.target.value }))} />
                  </div>
                </div>
                <div className="trip-section-box">
                  <label className="form-label">2. What is the goal of the trip?</label>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {TRIP_INTEREST_OPTIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`tag-toggle ${newTripForm.tripPreferences.includes(option) ? "active" : ""}`}
                        onClick={() => togglePreference(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  <p style={{ margin: 0, color: "#777", fontSize: 13, fontWeight: 700 }}>
                    Pick a few goals so the itinerary suggestions match what this trip is really for.
                  </p>
                </div>
                <div className="trip-section-box">
                  <label className="form-label">3. Do you already have booking info?</label>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {["yes", "no"].map((choice) => (
                      <button
                        key={choice}
                        type="button"
                        className={`tag-toggle ${newTripForm.bookingInfo.hasBookingInfo === choice ? "active" : ""}`}
                        onClick={() => setNewTripForm((prev) => ({
                          ...prev,
                          bookingInfo: {
                            ...prev.bookingInfo,
                            hasBookingInfo: choice,
                          },
                        }))}
                      >
                        {choice === "yes" ? "Yes, we do" : "Not yet"}
                      </button>
                    ))}
                  </div>
                  {newTripForm.bookingInfo.hasBookingInfo === "yes" ? (
                    <div className="trip-modal-grid" style={{ display: "grid", gap: 14 }}>
                      <div>
                        <label className="form-label">Arrival Date</label>
                        <input className="form-input" type="date" value={newTripForm.bookingInfo.arrivalDate} onChange={e => setNewTripForm(p => ({ ...p, bookingInfo: { ...p.bookingInfo, arrivalDate: e.target.value } }))} />
                      </div>
                      <div>
                        <label className="form-label">Arrival Time</label>
                        <input className="form-input" type="time" value={newTripForm.bookingInfo.arrivalTime} onChange={e => setNewTripForm(p => ({ ...p, bookingInfo: { ...p.bookingInfo, arrivalTime: e.target.value } }))} />
                      </div>
                      <div>
                        <label className="form-label">Arrival City / Airport</label>
                        <input className="form-input" type="text" placeholder="e.g. Shanghai Pudong" value={newTripForm.bookingInfo.arrivalCity} onChange={e => setNewTripForm(p => ({ ...p, bookingInfo: { ...p.bookingInfo, arrivalCity: e.target.value } }))} />
                      </div>
                      <div>
                        <label className="form-label">Layover City</label>
                        <input className="form-input" type="text" placeholder="Optional" value={newTripForm.bookingInfo.layoverCity} onChange={e => setNewTripForm(p => ({ ...p, bookingInfo: { ...p.bookingInfo, layoverCity: e.target.value } }))} />
                      </div>
                      <div>
                        <label className="form-label">Stay Name</label>
                        <input className="form-input" type="text" placeholder="e.g. The Garden Hotel" value={newTripForm.bookingInfo.stayName} onChange={e => setNewTripForm(p => ({ ...p, bookingInfo: { ...p.bookingInfo, stayName: e.target.value } }))} />
                      </div>
                      <div>
                        <label className="form-label">Stay Area</label>
                        <input className="form-input" type="text" placeholder="e.g. Yuexiu District" value={newTripForm.bookingInfo.stayArea} onChange={e => setNewTripForm(p => ({ ...p, bookingInfo: { ...p.bookingInfo, stayArea: e.target.value } }))} />
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label className="form-label">Booking Notes</label>
                        <input className="form-input" type="text" placeholder="Late check-in, train arrival, anything important..." value={newTripForm.bookingInfo.notes} onChange={e => setNewTripForm(p => ({ ...p, bookingInfo: { ...p.bookingInfo, notes: e.target.value } }))} />
                      </div>
                    </div>
                  ) : (
                    <p style={{ margin: 0, color: "#777", fontSize: 13, fontWeight: 700 }}>
                      No problem. You can still create the trip now and add the booking details later before generating the itinerary again.
                    </p>
                  )}
                </div>
                {formError && <p style={{ fontFamily: "'Bangers', cursive", fontSize: 15, color: "#ff6b6b", margin: 0, letterSpacing: "0.04em" }}>{formError}</p>}
                <button className="btn-primary" style={{ width: "100%", justifyContent: "center", fontSize: 20, padding: "14px", marginTop: 4 }} onClick={createTrip}>
                  Create Trip 🚀
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
