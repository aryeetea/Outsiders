import { useState } from "react";

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
    background: #fffdf9;
    border-bottom: 4px solid #1a1a2e;
    box-shadow: 0 4px 0 #1a1a2e;
  }

  .logo-mark {
    width: 36px; height: 36px;
    background: #ff6b6b; border: 3px solid #1a1a2e;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 3px 3px 0 #1a1a2e;
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
`;

const AVATAR_COLORS = ["#ff6b6b", "#4ecdc4", "#a29bfe", "#ffd93d", "#51cf66", "#ff6b9d"];
const TRIP_COLORS = [
  { bg: "#fff4e6", border: "#ff9a3c", emoji: "🏝" },
  { bg: "#e8f4fd", border: "#4ecdc4", emoji: "🗼" },
  { bg: "#f3e8fd", border: "#9b59b6", emoji: "🏔" },
];

const INITIAL_TRIPS = [
  {
    id: 1,
    name: "Miami Beach Trip",
    destination: "Miami, Florida",
    startDate: "2025-07-04",
    endDate: "2025-07-07",
    budget: 1200,
    spent: 420,
    members: ["JD", "AL", "MK", "RB"],
    color: TRIP_COLORS[0],
    status: "Planning",
    itinerary: [
      { day: 1, date: "Jul 4", activities: [{ time: "2:00 PM", name: "Arrive & check in 🏨" }, { time: "6:00 PM", name: "Beach sunset walk 🌅" }, { time: "8:00 PM", name: "Dinner at Ocean Drive 🍽" }] },
      { day: 2, date: "Jul 5", activities: [{ time: "10:00 AM", name: "Beach day ☀️" }, { time: "1:00 PM", name: "Lunch at La Palapa 🌮" }, { time: "4:00 PM", name: "Pool time 🏊" }, { time: "9:00 PM", name: "Nightlife on Collins Ave 🎉" }] },
      { day: 3, date: "Jul 6", activities: [{ time: "9:00 AM", name: "Wynwood Walls art tour 🎨" }, { time: "12:00 PM", name: "Little Havana food tour 🥘" }, { time: "7:00 PM", name: "Rooftop farewell dinner 🌃" }] },
    ],
    packingList: [
      { id: 1, item: "Sunscreen SPF 50 ☀️", packed: true },
      { id: 2, item: "Swimsuit 👙", packed: true },
      { id: 3, item: "Flip flops 🩴", packed: false },
      { id: 4, item: "Beach towel 🏖", packed: false },
      { id: 5, item: "Sunglasses 🕶", packed: true },
      { id: 6, item: "Travel adapter 🔌", packed: false },
      { id: 7, item: "Portable charger 🔋", packed: false },
      { id: 8, item: "Travel insurance docs 📄", packed: false },
    ],
  },
  {
    id: 2,
    name: "Paris Weekend",
    destination: "Paris, France",
    startDate: "2025-09-12",
    endDate: "2025-09-15",
    budget: 2500,
    spent: 0,
    members: ["JD", "MK"],
    color: TRIP_COLORS[1],
    status: "Dreaming",
    itinerary: [
      { day: 1, date: "Sep 12", activities: [{ time: "3:00 PM", name: "Arrive CDG ✈️" }, { time: "7:00 PM", name: "Eiffel Tower visit 🗼" }] },
    ],
    packingList: [
      { id: 1, item: "Passport 🛂", packed: false },
      { id: 2, item: "Euro cash 💶", packed: false },
      { id: 3, item: "Comfortable walking shoes 👟", packed: false },
    ],
  },
];

const IconLogoMark = () => <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" fill="white"/></svg>;
const IconHome = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IconCalendar = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconUsers = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconPlane = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>;
const IconSplit = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const IconHeart = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const IconStar = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IconBell = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const IconPlus = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconCheck = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconTrash = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>;

const NAV_ITEMS = [
  { icon: <IconHome />, label: "Dashboard" },
  { icon: <IconCalendar />, label: "Hangouts" },
  { icon: <IconUsers />, label: "My Crew" },
  { icon: <IconPlane />, label: "Trips" },
  { icon: <IconSplit />, label: "Bill Split" },
  { icon: <IconStar />, label: "Ratings" },
  { icon: <IconHeart />, label: "Debrief" },
];

const formatDate = (d) => {
  if (!d) return "";
  const date = new Date(d + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const getDays = (start, end) => {
  if (!start || !end) return 0;
  return Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)) + 1;
};

const NAV_TARGETS = {
  "Dashboard": "dashboard",
  "Hangouts": "create-hangout",
  "My Crew": "friend-groups",
  "Trips": "trip-planning",
  "Bill Split": "bill-split",
  "Ratings": "rate-outing",
  "Debrief": "debrief",
};

export default function OutsidersTripPlanning({ onNavigate }) {
  const [activeNav, setActiveNav] = useState("Trips");
  const [trips, setTrips] = useState(INITIAL_TRIPS);
  const [selectedTrip, setSelectedTrip] = useState(INITIAL_TRIPS[0]);
  const [activeTab, setActiveTab] = useState("Overview");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newActivity, setNewActivity] = useState({ day: 1, time: "", name: "" });
  const [newPackItem, setNewPackItem] = useState("");
  const [newTripForm, setNewTripForm] = useState({ name: "", destination: "", startDate: "", endDate: "", budget: "" });
  const [formError, setFormError] = useState("");
  const handleNav = (label) => {
    setActiveNav(label);
    onNavigate?.(NAV_TARGETS[label] || "trip-planning");
  };

  const updateTrip = (updatedTrip) => {
    setTrips(prev => prev.map(t => t.id === updatedTrip.id ? updatedTrip : t));
    setSelectedTrip(updatedTrip);
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
          ? { ...d, activities: [...d.activities, { time: newActivity.time, name: newActivity.name }].sort((a, b) => a.time.localeCompare(b.time)) }
          : d
      )
    };
    updateTrip(updated);
    setNewActivity({ day: newActivity.day, time: "", name: "" });
  };

  const createTrip = () => {
    if (!newTripForm.name.trim() || !newTripForm.destination.trim() || !newTripForm.startDate || !newTripForm.endDate) {
      setFormError("Fill in all required fields!");
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
      members: ["JD"],
      color: TRIP_COLORS[trips.length % TRIP_COLORS.length],
      status: "Planning",
      itinerary,
      packingList: [{ id: 1, item: "Passport / ID 🛂", packed: false }, { id: 2, item: "Phone charger 🔋", packed: false }],
    };
    setTrips(prev => [...prev, newTrip]);
    setSelectedTrip(newTrip);
    setShowCreateModal(false);
    setNewTripForm({ name: "", destination: "", startDate: "", endDate: "", budget: "" });
    setFormError("");
    setActiveTab("Overview");
  };

  const packedCount = selectedTrip?.packingList.filter(p => p.packed).length || 0;
  const totalPack = selectedTrip?.packingList.length || 0;
  const budgetPct = selectedTrip ? Math.min(Math.round((selectedTrip.spent / selectedTrip.budget) * 100), 100) : 0;
  const budgetColor = budgetPct > 80 ? "#ff6b6b" : budgetPct > 50 ? "#ff9a3c" : "#51cf66";

  return (
    <>
      <style>{STYLES}</style>
      <div className="root">

        {/* Top Nav */}
        <nav className="top-nav">
          <div style={{ padding: "0 24px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="logo-mark"><IconLogoMark /></div>
              <span className="bangers" style={{ fontSize: 26, color: "#1a1a2e" }}>Outsiders</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ position: "relative", cursor: "pointer" }} onClick={() => onNavigate?.("profile")}><IconBell /><div className="notif-dot" /></div>
              <div className="profile-chip" onClick={() => onNavigate?.("profile")}>
                <div style={{ width: 30, height: 30, background: "#ff6b6b", border: "2px solid #1a1a2e", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 11, color: "#fff" }}>JD</div>
                <span style={{ fontWeight: 800, fontSize: 14 }}>Jordan</span>
              </div>
            </div>
          </div>
        </nav>

        <div className="layout">

          {/* Sidebar */}
          <aside className="sidebar">
            <p className="nav-section-label">Menu</p>
            {NAV_ITEMS.map((item) => (
              <div key={item.label} className={`nav-item ${activeNav === item.label ? "active" : ""}`} onClick={() => handleNav(item.label)}>
                {item.icon} {item.label}
              </div>
            ))}
          </aside>

          {/* Main */}
          <main className="main">

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <div>
                <span className="comic-tag">Adventure awaits! ✈️</span>
                <h1 className="bangers" style={{ fontSize: 34, margin: "6px 0 4px", color: "#1a1a2e" }}>Trip Planning ✈️</h1>
                <p style={{ fontSize: 14, color: "#888", fontWeight: 700, margin: 0 }}>Plan your next crew adventure.</p>
              </div>
              <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                <IconPlus /> New Trip
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 24 }}>

              {/* Trip list */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <p className="bangers" style={{ fontSize: 13, color: "#aaa", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 4px" }}>Your Trips</p>
                {trips.map((trip) => (
                  <div
                    key={trip.id}
                    className={`trip-card ${selectedTrip?.id === trip.id ? "active" : ""}`}
                    style={{ background: trip.color.bg, borderColor: selectedTrip?.id === trip.id ? "#ff6b6b" : trip.color.border, boxShadow: `5px 5px 0 ${selectedTrip?.id === trip.id ? "#ff6b6b" : trip.color.border}` }}
                    onClick={() => { setSelectedTrip(trip); setActiveTab("Overview"); }}
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

                {/* New trip prompt */}
                <div
                  onClick={() => setShowCreateModal(true)}
                  style={{ border: "3px dashed #ccc", borderRadius: 14, padding: "16px", textAlign: "center", cursor: "pointer", transition: "border-color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#ff6b6b"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#ccc"}
                >
                  <p className="bangers" style={{ fontSize: 15, color: "#aaa", margin: 0 }}>+ Plan New Trip</p>
                </div>
              </div>

              {/* Trip detail */}
              {selectedTrip && (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

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
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
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
                            <div key={i} className="activity-row">
                              <span style={{ fontSize: 12, fontWeight: 900, color: "#aaa", minWidth: 60 }}>{a.time}</span>
                              <div style={{ width: 8, height: 8, background: selectedTrip.color.border, borderRadius: "50%", border: "2px solid #1a1a2e", flexShrink: 0 }} />
                              <span style={{ fontSize: 14, fontWeight: 700, flex: 1 }}>{a.name}</span>
                            </div>
                          ))}
                        </div>
                      ))}

                      {/* Add activity */}
                      <div style={{ background: "#fffdf9", border: "3px dashed #ccc", borderRadius: 12, padding: "16px" }}>
                        <p className="bangers" style={{ fontSize: 15, margin: "0 0 12px" }}>+ Add Activity</p>
                        <div style={{ display: "grid", gridTemplateColumns: "100px 80px 1fr auto", gap: 10, alignItems: "end" }}>
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
          </main>
        </div>

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
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
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
