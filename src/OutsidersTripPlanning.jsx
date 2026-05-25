import { useState } from "react";
import OutsidersSideNav from "./OutsidersSideNav";

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

  .top-nav {
    position: sticky; top: 0; z-index: 50;
    background: #fffdf7;
    border-bottom: 4px solid #17151f;
    box-shadow: 0 4px 0 #17151f;
  }

  .logo-mark {
    width: 46px; height: 46px;
    background: #ff7a59; border: 3px solid #17151f;
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 4px 4px 0 #17151f;
    transform: rotate(-7deg);
  }

  .logo-link {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
  }

  .chip-btn {
    border: 3px solid #17151f;
    background: #fff3c8;
    color: #17151f;
    padding: 9px 14px;
    border-radius: 999px;
    cursor: pointer;
    font: 400 14px 'Bangers', cursive;
    letter-spacing: 0.06em;
    box-shadow: 3px 3px 0 #17151f;
    transition: transform 160ms ease, box-shadow 160ms ease;
  }

  .chip-btn:hover {
    transform: translate(-1px, -2px);
    box-shadow: 5px 5px 0 #17151f;
  }

  .layout { display: flex; flex: 1; position: relative; z-index: 1; }

  .sidebar {
    width: 220px; flex-shrink: 0;
    background: #fffdf9;
    border-right: 4px solid #1a1a2e;
    padding: 24px 16px;
    display: flex; flex-direction: column; gap: 6px;
    position: sticky; top: 68px;
    height: calc(100vh - 68px);
    overflow-y: auto;
  }

  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; border-radius: 10px;
    cursor: pointer; font-weight: 800; font-size: 14px;
    color: #666; border: 2.5px solid transparent;
    transition: all 0.15s;
  }
  .nav-item:hover { background: #f5f3ee; color: #1a1a2e; border-color: #e0dbd0; }
  .nav-item.active { background: #fff; color: #1a1a2e; border: 2.5px solid #1a1a2e; box-shadow: 3px 3px 0 #1a1a2e; }

  .nav-section-label {
    font-family: 'Bangers', cursive;
    font-size: 12px; letter-spacing: 0.1em;
    color: #bbb; padding: 8px 14px 4px;
    text-transform: uppercase;
  }

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
    .trip-detail-layout, .trip-overview-grid, .trip-modal-grid, .trip-activity-grid { grid-template-columns: 1fr; }
    .trip-planning-shell { padding: 28px 22px 36px; }
    .trip-empty-panel { min-height: 380px; }
  }
  @media (max-width: 640px) {
    .main { padding: 18px 14px; }
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

export default function OutsidersTripPlanning({ onNavigate, appData, setAppData }) {
  const trips = appData?.trips || [];
  const [selectedTripId, setSelectedTripId] = useState(() => (appData?.trips?.[0]?.id || null));
  const [activeTab, setActiveTab] = useState("Overview");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newActivity, setNewActivity] = useState({ day: 1, time: "", name: "" });
  const [newPackItem, setNewPackItem] = useState("");
  const [newTripForm, setNewTripForm] = useState({ name: "", destination: "", startDate: "", endDate: "", budget: "" });
  const [formError, setFormError] = useState("");

  const selectedTrip = trips.find((trip) => trip.id === selectedTripId) || trips[0] || null;

  const persistTrips = (updater, nextSelectedTripId = null) => {
    setAppData?.((prev) => {
      const previousTrips = prev?.trips || [];
      const nextTrips = typeof updater === "function" ? updater(previousTrips) : updater;
      const selectedId = nextSelectedTripId === null ? selectedTrip?.id : nextSelectedTripId;
      setSelectedTripId(selectedId ? nextTrips.find((trip) => trip.id === selectedId)?.id || nextTrips[0]?.id || null : nextTrips[0]?.id || null);
      return { ...prev, trips: nextTrips };
    });
  };

  const updateTrip = (updatedTrip) => {
    persistTrips((previousTrips) => previousTrips.map((trip) => (trip.id === updatedTrip.id ? updatedTrip : trip)), updatedTrip.id);
  };

  const togglePackItem = (itemId) => {
    const updated = { ...selectedTrip, packingList: selectedTrip.packingList.map(p => p.id === itemId ? { ...p, packed: !p.packed } : p) };
    updateTrip(updated);
  };

  const deletePackItem = (itemId) => {
    const updated = { ...selectedTrip, packingList: selectedTrip.packingList.filter(p => p.id !== itemId) };
    updateTrip(updated);
  };

  const addPackItem = () => {
    if (!newPackItem.trim()) return;
    const updated = { ...selectedTrip, packingList: [...selectedTrip.packingList, { id: Date.now(), item: newPackItem.trim(), packed: false }] };
    updateTrip(updated);
    setNewPackItem("");
  };

  const addActivity = () => {
    if (!newActivity.time || !newActivity.name.trim()) return;
    const updated = {
      ...selectedTrip,
      itinerary: selectedTrip.itinerary.map(d =>
        d.day === newActivity.day
          ? { ...d, activities: [...d.activities, { id: Date.now(), time: newActivity.time, name: newActivity.name.trim() }].sort((a, b) => a.time.localeCompare(b.time)) }
          : d
      )
    };
    updateTrip(updated);
    setNewActivity({ day: newActivity.day, time: "", name: "" });
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
    updateTrip(updated);
  };

  const deleteTrip = () => {
    if (!selectedTrip) return;
    const confirmed = window.confirm(`Delete ${selectedTrip.name}? This removes its itinerary and packing list.`);
    if (!confirmed) return;
    persistTrips(
      (previousTrips) => previousTrips.filter((trip) => trip.id !== selectedTrip.id),
      null
    );
    setActiveTab("Overview");
  };

  const createTrip = () => {
    if (!newTripForm.name.trim() || !newTripForm.destination.trim() || !newTripForm.startDate || !newTripForm.endDate) {
      setFormError("Fill in all required fields!");
      return;
    }
    if (new Date(newTripForm.endDate) < new Date(newTripForm.startDate)) {
      setFormError("End date has to be after the start date.");
      return;
    }
    const days = getDays(newTripForm.startDate, newTripForm.endDate);
    const itinerary = Array.from({ length: days }, (_, i) => ({
      day: i + 1,
      date: formatDate(new Date(new Date(newTripForm.startDate).getTime() + i * 86400000).toISOString().split("T")[0]),
      activities: [],
    }));
    const newTrip = {
      id: Date.now(),
      name: newTripForm.name,
      destination: newTripForm.destination,
      startDate: newTripForm.startDate,
      endDate: newTripForm.endDate,
      budget: Number(newTripForm.budget) || 0,
      spent: 0,
      members: [String(appData?.profile?.name || appData?.profile?.username || "YOU").slice(0, 3).toUpperCase()],
      color: TRIP_COLORS[trips.length % TRIP_COLORS.length],
      status: "Planning",
      itinerary,
      packingList: [{ id: 1, item: "Passport / ID 🛂", packed: false }, { id: 2, item: "Phone charger 🔋", packed: false }],
      ratings: [],
    };
    persistTrips((previousTrips) => [...previousTrips, newTrip], newTrip.id);
    setShowCreateModal(false);
    setNewTripForm({ name: "", destination: "", startDate: "", endDate: "", budget: "" });
    setFormError("");
    setActiveTab("Overview");
  };

  const packedCount = selectedTrip?.packingList.filter(p => p.packed).length || 0;
  const totalPack = selectedTrip?.packingList.length || 0;
  const budgetPct = selectedTrip ? Math.min(Math.round((selectedTrip.spent / selectedTrip.budget) * 100), 100) : 0;
  const budgetColor = budgetPct > 80 ? "#ff6b6b" : budgetPct > 50 ? "#ff9a3c" : "#51cf66";
  const profileName = appData?.profile?.name || appData?.profile?.username || "You";

  return (
    <>
      <style>{STYLES}</style>
      <div className="root">

        <OutsidersSideNav activeLabel="Trips" onNavigate={onNavigate} profileName={profileName} notificationCount={(appData?.notifications || []).filter((n) => !n.read).length}>
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
                      <button type="button" className="btn-danger" onClick={deleteTrip}>Delete trip</button>
                    </div>

                    {/* Budget bar */}
                    {selectedTrip.budget > 0 && (
                      <div style={{ marginTop: 16 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span className="bangers" style={{ fontSize: 14, color: "#1a1a2e" }}>💸 Budget</span>
                          <span style={{ fontSize: 13, fontWeight: 800, color: budgetColor }}>${selectedTrip.spent} / ${selectedTrip.budget}</span>
                        </div>
                        <div className="budget-bar">
                          <div className="budget-fill" style={{ width: `${budgetPct}%`, background: budgetColor }} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tabs */}
                  <div style={{ display: "flex", gap: 8, background: "#f5f3ee", padding: 6, borderRadius: 12, border: "3px solid #1a1a2e", width: "fit-content", boxShadow: "3px 3px 0 #1a1a2e" }}>
                    {["Overview", "Itinerary", "Packing List"].map(t => (
                      <button key={t} className={`tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>{t}</button>
                    ))}
                  </div>

                  {/* Overview */}
                  {activeTab === "Overview" && (
                    <div className="trip-overview-grid" style={{ display: "grid", gap: 16 }}>
                      {[
                        { label: "Days", value: getDays(selectedTrip.startDate, selectedTrip.endDate), emoji: "🌙", color: "#4ecdc4", bg: "#e8f4fd", border: "#4ecdc4" },
                        { label: "Going", value: selectedTrip.members.length, emoji: "👥", color: "#51cf66", bg: "#e8fde8", border: "#51cf66" },
                        { label: "Budget Left", value: `$${selectedTrip.budget - selectedTrip.spent}`, emoji: "💸", color: "#ff9a3c", bg: "#fff4e6", border: "#ff9a3c" },
                        { label: "Packed", value: `${packedCount}/${totalPack}`, emoji: "🎒", color: "#a29bfe", bg: "#f3e8fd", border: "#9b59b6" },
                      ].map(s => (
                        <div key={s.label} style={{ background: s.bg, border: `3px solid ${s.border}`, borderRadius: 14, padding: "18px 20px", boxShadow: `4px 4px 0 ${s.border}` }}>
                          <p style={{ fontSize: 13, fontWeight: 800, color: "#888", margin: "0 0 6px" }}>{s.emoji} {s.label}</p>
                          <p className="bangers" style={{ fontSize: 32, margin: 0, color: s.color }}>{s.value}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Itinerary */}
                  {activeTab === "Itinerary" && (
                    <div className="card">
                      <div className="section-header">
                        <h3 className="bangers" style={{ fontSize: 20, margin: 0 }}>📅 Day by Day Plan</h3>
                      </div>

                      {selectedTrip.itinerary.map((day) => (
                        <div key={day.day} className="day-card">
                          <p className="bangers" style={{ fontSize: 17, margin: "0 0 10px", color: "#1a1a2e" }}>Day {day.day} — {day.date}</p>
                          {day.activities.length === 0 && (
                            <p style={{ fontSize: 13, fontWeight: 700, color: "#ccc", margin: "0 0 8px" }}>Nothing planned yet — add something!</p>
                          )}
                          {day.activities.map((a, i) => (
                            <div key={a.id || `${a.time}-${a.name}-${i}`} className="activity-row">
                              <span style={{ fontSize: 12, fontWeight: 900, color: "#aaa", minWidth: 60 }}>{a.time}</span>
                              <div style={{ width: 8, height: 8, background: selectedTrip.color.border, borderRadius: "50%", border: "2px solid #1a1a2e", flexShrink: 0 }} />
                              <span style={{ fontSize: 14, fontWeight: 700, flex: 1 }}>{a.name}</span>
                              <button type="button" className="btn-danger" style={{ padding: "4px 8px" }} onClick={() => deleteActivity(day.day, a.id)}>
                                <IconTrash />
                              </button>
                            </div>
                          ))}
                        </div>
                      ))}

                      {/* Add activity */}
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
                            <input className="form-input" type="text" placeholder="e.g. Beach day ☀️" value={newActivity.name} onChange={e => setNewActivity(p => ({ ...p, name: e.target.value }))} onKeyDown={e => e.key === "Enter" && addActivity()} />
                          </div>
                          <button className="btn-secondary" onClick={addActivity} style={{ marginBottom: 0 }}>Add</button>
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
                <div>
                  <label className="form-label">Trip Name *</label>
                  <input className="form-input" type="text" placeholder="e.g. Miami Beach Trip" value={newTripForm.name} onChange={e => setNewTripForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">Destination *</label>
                  <input className="form-input" type="text" placeholder="e.g. Miami, Florida" value={newTripForm.destination} onChange={e => setNewTripForm(p => ({ ...p, destination: e.target.value }))} />
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
