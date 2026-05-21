import { useState } from "react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Nunito:wght@400;600;700;800;900&display=swap');
  * { box-sizing: border-box; }
  body { background: #f5f3ee; margin: 0; }
  .root { font-family: 'Nunito', sans-serif; background: #f5f3ee; color: #1a1a2e; min-height: 100vh; display: flex; flex-direction: column; }
  .root::before { content: ''; position: fixed; inset: 0; background-image: radial-gradient(circle, #1a1a2e 1px, transparent 1px); background-size: 24px 24px; opacity: 0.03; pointer-events: none; z-index: 0; }
  .bangers { font-family: 'Bangers', cursive; letter-spacing: 0.04em; }
  .top-nav { position: sticky; top: 0; z-index: 50; background: #fffdf9; border-bottom: 4px solid #1a1a2e; box-shadow: 0 4px 0 #1a1a2e; }
  .logo-mark { width: 36px; height: 36px; background: #ff6b6b; border: 3px solid #1a1a2e; border-radius: 10px; display: flex; align-items: center; justify-content: center; box-shadow: 3px 3px 0 #1a1a2e; }
  .layout { display: flex; flex: 1; position: relative; z-index: 1; }
  .sidebar { width: 220px; flex-shrink: 0; background: #fffdf9; border-right: 4px solid #1a1a2e; padding: 24px 16px; display: flex; flex-direction: column; gap: 6px; position: sticky; top: 68px; height: calc(100vh - 68px); overflow-y: auto; }
  .nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 10px; cursor: pointer; font-weight: 800; font-size: 14px; color: #666; border: 2.5px solid transparent; transition: all 0.15s; }
  .nav-item:hover { background: #f5f3ee; color: #1a1a2e; border-color: #e0dbd0; }
  .nav-item.active { background: #fff; color: #1a1a2e; border: 2.5px solid #1a1a2e; box-shadow: 3px 3px 0 #1a1a2e; }
  .nav-section-label { font-family: 'Bangers', cursive; font-size: 12px; letter-spacing: 0.1em; color: #bbb; padding: 8px 14px 4px; text-transform: uppercase; }
  .main { flex: 1; padding: 28px 32px; overflow-y: auto; }
  .card { background: #fff; border: 3px solid #1a1a2e; border-radius: 16px; box-shadow: 5px 5px 0 #1a1a2e; padding: 22px 24px; }
  .btn-primary { background: #ff6b6b; color: #fff; border: 3px solid #1a1a2e; cursor: pointer; font-family: 'Bangers', cursive; letter-spacing: 0.08em; border-radius: 10px; box-shadow: 4px 4px 0 #1a1a2e; transition: transform 0.12s, box-shadow 0.12s; font-size: 16px; padding: 10px 20px; display: inline-flex; align-items: center; gap: 8px; }
  .btn-primary:hover { transform: translate(-2px,-2px); box-shadow: 6px 6px 0 #1a1a2e; }
  .btn-secondary { background: #ffd93d; color: #1a1a2e; border: 3px solid #1a1a2e; cursor: pointer; font-family: 'Bangers', cursive; letter-spacing: 0.08em; border-radius: 10px; box-shadow: 4px 4px 0 #1a1a2e; transition: transform 0.12s, box-shadow 0.12s; font-size: 15px; padding: 9px 18px; display: inline-flex; align-items: center; gap: 8px; }
  .btn-secondary:hover { transform: translate(-2px,-2px); box-shadow: 6px 6px 0 #1a1a2e; }
  .btn-outline { background: #fff; color: #1a1a2e; border: 3px solid #1a1a2e; cursor: pointer; font-family: 'Bangers', cursive; letter-spacing: 0.08em; border-radius: 10px; box-shadow: 3px 3px 0 #1a1a2e; transition: transform 0.12s, box-shadow 0.12s; font-size: 14px; padding: 8px 16px; display: inline-flex; align-items: center; gap: 6px; }
  .btn-outline:hover { transform: translate(-2px,-2px); box-shadow: 5px 5px 0 #1a1a2e; }
  .btn-green { background: #51cf66; color: #fff; border: 3px solid #1a1a2e; cursor: pointer; font-family: 'Bangers', cursive; letter-spacing: 0.06em; border-radius: 8px; box-shadow: 3px 3px 0 #1a1a2e; font-size: 14px; padding: 7px 14px; transition: transform 0.12s; }
  .btn-green:hover { transform: translate(-1px,-1px); }
  .form-input { width: 100%; padding: 11px 14px; font-size: 14px; font-family: 'Nunito', sans-serif; font-weight: 700; color: #1a1a2e; background: #fffdf9; border: 3px solid #1a1a2e; border-radius: 10px; outline: none; transition: box-shadow 0.15s, border-color 0.15s; box-shadow: 3px 3px 0 #1a1a2e; }
  .form-input:focus { border-color: #ff6b6b; box-shadow: 3px 3px 0 #ff6b6b; }
  .form-input::placeholder { color: #bbb; font-weight: 600; }
  .form-label { display: block; font-family: 'Bangers', cursive; font-size: 15px; letter-spacing: 0.05em; color: #1a1a2e; margin-bottom: 6px; }
  .avatar { width: 36px; height: 36px; border-radius: 50%; border: 2.5px solid #1a1a2e; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 12px; color: #fff; flex-shrink: 0; box-shadow: 2px 2px 0 #1a1a2e; }
  .badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 6px; font-family: 'Bangers', cursive; font-size: 12px; letter-spacing: 0.05em; border: 2px solid; }
  .expense-row { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 2px dashed #f0ebe0; }
  .expense-row:last-child { border-bottom: none; }
  .settle-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 2px dashed #f0ebe0; }
  .settle-row:last-child { border-bottom: none; }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 24px; }
  .modal { background: #fff; border: 4px solid #1a1a2e; border-radius: 20px; box-shadow: 10px 10px 0 #1a1a2e; padding: 36px 32px; width: 100%; max-width: 480px; position: relative; max-height: 90vh; overflow-y: auto; }
  .close-btn { position: absolute; top: 16px; right: 16px; background: #f5f3ee; border: 2px solid #1a1a2e; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 16px; box-shadow: 2px 2px 0 #1a1a2e; }
  .comic-tag { display: inline-block; background: #ffd93d; border: 2px solid #1a1a2e; border-radius: 6px; padding: 1px 10px; font-family: 'Bangers', cursive; font-size: 12px; letter-spacing: 0.06em; box-shadow: 2px 2px 0 #1a1a2e; transform: rotate(-2deg); }
  .profile-chip { display: flex; align-items: center; gap: 8px; background: #fff; border: 3px solid #1a1a2e; border-radius: 50px; padding: 4px 14px 4px 4px; box-shadow: 3px 3px 0 #1a1a2e; cursor: pointer; }
  .notif-dot { width: 8px; height: 8px; background: #ff6b6b; border: 2px solid #1a1a2e; border-radius: 50%; position: absolute; top: -2px; right: -2px; }
  .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
`;

const AVATAR_COLORS = ["#ff6b6b", "#4ecdc4", "#a29bfe", "#ffd93d", "#51cf66", "#ff6b9d"];
const MEMBERS = [
  { initials: "JD", name: "Jordan (You)" },
  { initials: "AL", name: "Alex" },
  { initials: "MK", name: "Maya" },
  { initials: "RB", name: "Ryan" },
];

const INITIAL_EXPENSES = [
  { id: 1, desc: "Dinner at Ocean Drive 🍽", amount: 120, paidBy: 0, splitWith: [0,1,2,3], settled: false, emoji: "🍽" },
  { id: 2, desc: "Uber to beach 🚗", amount: 32, paidBy: 1, splitWith: [0,1,2,3], settled: false, emoji: "🚗" },
  { id: 3, desc: "Hotel room (2 nights) 🏨", amount: 280, paidBy: 0, splitWith: [0,1,2,3], settled: true, emoji: "🏨" },
  { id: 4, desc: "Drinks at rooftop 🍹", amount: 68, paidBy: 2, splitWith: [0,1,2], settled: false, emoji: "🍹" },
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
const IconArrow = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;

const NAV_ITEMS = [
  { icon: <IconHome />, label: "Dashboard" },
  { icon: <IconCalendar />, label: "Hangouts" },
  { icon: <IconUsers />, label: "My Crew" },
  { icon: <IconPlane />, label: "Trips" },
  { icon: <IconSplit />, label: "Bill Split" },
  { icon: <IconStar />, label: "Ratings" },
  { icon: <IconHeart />, label: "Debrief" },
];

function calcBalances(expenses) {
  const balances = MEMBERS.map(() => 0);
  expenses.filter(e => !e.settled).forEach(e => {
    const share = e.amount / e.splitWith.length;
    e.splitWith.forEach(i => { balances[i] -= share; });
    balances[e.paidBy] += e.amount;
  });
  return balances;
}

function calcSettlements(balances) {
  const settlements = [];
  const pos = balances.map((b, i) => ({ i, b })).filter(x => x.b > 0.01).sort((a, b) => b.b - a.b);
  const neg = balances.map((b, i) => ({ i, b })).filter(x => x.b < -0.01).sort((a, b) => a.b - b.b);
  let pi = 0, ni = 0;
  const p = pos.map(x => ({ ...x }));
  const n = neg.map(x => ({ ...x }));
  while (pi < p.length && ni < n.length) {
    const amount = Math.min(p[pi].b, -n[ni].b);
    if (amount > 0.01) settlements.push({ from: n[ni].i, to: p[pi].i, amount: Math.round(amount * 100) / 100 });
    p[pi].b -= amount;
    n[ni].b += amount;
    if (Math.abs(p[pi].b) < 0.01) pi++;
    if (Math.abs(n[ni].b) < 0.01) ni++;
  }
  return settlements;
}

export default function OutsidersBillSplit() {
  const [activeNav, setActiveNav] = useState("Bill Split");
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ desc: "", amount: "", paidBy: 0, splitWith: [0,1,2,3] });
  const [activeTab, setActiveTab] = useState("Expenses");

  const balances = calcBalances(expenses);
  const settlements = calcSettlements(balances);
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const unsettled = expenses.filter(e => !e.settled).reduce((s, e) => s + e.amount, 0);

  const addExpense = () => {
    if (!form.desc.trim() || !form.amount) return;
    setExpenses(prev => [...prev, { id: Date.now(), desc: form.desc, amount: Number(form.amount), paidBy: Number(form.paidBy), splitWith: form.splitWith, settled: false, emoji: "💸" }]);
    setForm({ desc: "", amount: "", paidBy: 0, splitWith: [0,1,2,3] });
    setShowModal(false);
  };

  const settleUp = (expId) => setExpenses(prev => prev.map(e => e.id === expId ? { ...e, settled: true } : e));
  const toggleSplit = (i) => setForm(prev => ({ ...prev, splitWith: prev.splitWith.includes(i) ? prev.splitWith.filter(x => x !== i) : [...prev.splitWith, i] }));

  return (
    <>
      <style>{STYLES}</style>
      <div className="root">
        <nav className="top-nav">
          <div style={{ padding: "0 24px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="logo-mark"><IconLogoMark /></div>
              <span className="bangers" style={{ fontSize: 26, color: "#1a1a2e" }}>Outsiders</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ position: "relative", cursor: "pointer" }}><IconBell /><div className="notif-dot" /></div>
              <div className="profile-chip">
                <div style={{ width: 30, height: 30, background: "#ff6b6b", border: "2px solid #1a1a2e", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 11, color: "#fff" }}>JD</div>
                <span style={{ fontWeight: 800, fontSize: 14 }}>Jordan</span>
              </div>
            </div>
          </div>
        </nav>

        <div className="layout">
          <aside className="sidebar">
            <p className="nav-section-label">Menu</p>
            {NAV_ITEMS.map(item => (
              <div key={item.label} className={`nav-item ${activeNav === item.label ? "active" : ""}`} onClick={() => setActiveNav(item.label)}>
                {item.icon} {item.label}
              </div>
            ))}
          </aside>

          <main className="main">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <div>
                <span className="comic-tag">Split it fair! 💸</span>
                <h1 className="bangers" style={{ fontSize: 34, margin: "6px 0 4px" }}>Bill Split 💸</h1>
                <p style={{ fontSize: 14, color: "#888", fontWeight: 700, margin: 0 }}>Miami Beach Trip · Nobody gets left holding the bill.</p>
              </div>
              <button className="btn-primary" onClick={() => setShowModal(true)}><IconPlus /> Add Expense</button>
            </div>

            {/* Stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: 16, marginBottom: 28 }}>
              {[
                { label: "Total Spent", value: `$${totalSpent}`, bg: "#fff4e6", border: "#ff9a3c", color: "#ff9a3c" },
                { label: "Unsettled", value: `$${unsettled.toFixed(0)}`, bg: "#fde8f0", border: "#ff6b9d", color: "#ff6b9d" },
                { label: "Expenses", value: expenses.length, bg: "#e8f4fd", border: "#4ecdc4", color: "#4ecdc4" },
                { label: "Settled", value: expenses.filter(e => e.settled).length, bg: "#e8fde8", border: "#51cf66", color: "#51cf66" },
              ].map(s => (
                <div key={s.label} style={{ background: s.bg, border: `3px solid ${s.border}`, borderRadius: 14, padding: "16px 18px", boxShadow: `4px 4px 0 ${s.border}` }}>
                  <p style={{ fontSize: 12, fontWeight: 800, color: "#888", margin: "0 0 4px", textTransform: "uppercase" }}>{s.label}</p>
                  <p className="bangers" style={{ fontSize: 28, margin: 0, color: s.color }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 8, background: "#f5f3ee", padding: 6, borderRadius: 12, border: "3px solid #1a1a2e", width: "fit-content", boxShadow: "3px 3px 0 #1a1a2e", marginBottom: 24 }}>
              {["Expenses", "Settle Up", "Balances"].map(t => (
                <button key={t} onClick={() => setActiveTab(t)} style={{ padding: "9px 20px", fontFamily: "'Bangers', cursive", fontSize: 16, letterSpacing: "0.05em", border: "3px solid transparent", borderRadius: 10, cursor: "pointer", background: activeTab === t ? "#fff" : "none", color: activeTab === t ? "#1a1a2e" : "#888", borderColor: activeTab === t ? "#1a1a2e" : "transparent", boxShadow: activeTab === t ? "3px 3px 0 #1a1a2e" : "none" }}>{t}</button>
              ))}
            </div>

            {activeTab === "Expenses" && (
              <div className="card">
                <div className="section-header">
                  <h3 className="bangers" style={{ fontSize: 20, margin: 0 }}>All Expenses</h3>
                </div>
                {expenses.map(e => (
                  <div key={e.id} className="expense-row">
                    <div style={{ width: 44, height: 44, background: e.settled ? "#f0ebe0" : "#fff4e6", border: `3px solid ${e.settled ? "#ccc" : "#ff9a3c"}`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: `3px 3px 0 ${e.settled ? "#ccc" : "#ff9a3c"}`, flexShrink: 0 }}>{e.emoji}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 900, fontSize: 14, margin: 0, color: e.settled ? "#aaa" : "#1a1a2e", textDecoration: e.settled ? "line-through" : "none" }}>{e.desc}</p>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#888", margin: 0 }}>Paid by {MEMBERS[e.paidBy].initials} · Split {e.splitWith.length} ways</p>
                    </div>
                    <span className="bangers" style={{ fontSize: 20, color: e.settled ? "#aaa" : "#ff6b6b" }}>${e.amount}</span>
                    {!e.settled
                      ? <button className="btn-green" onClick={() => settleUp(e.id)}>Settle</button>
                      : <span className="badge" style={{ background: "#e8fde8", color: "#51cf66", borderColor: "#51cf66" }}>✓ Done</span>
                    }
                  </div>
                ))}
              </div>
            )}

            {activeTab === "Settle Up" && (
              <div className="card">
                <div className="section-header">
                  <h3 className="bangers" style={{ fontSize: 20, margin: 0 }}>Who Owes Who 🧾</h3>
                </div>
                {settlements.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px 0" }}>
                    <p style={{ fontSize: 36, margin: "0 0 8px" }}>🎉</p>
                    <p className="bangers" style={{ fontSize: 20, color: "#51cf66", margin: 0 }}>All settled up!</p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#aaa", margin: 0 }}>Nobody owes anyone anything.</p>
                  </div>
                ) : settlements.map((s, i) => (
                  <div key={i} className="settle-row">
                    <div className="avatar" style={{ background: AVATAR_COLORS[s.from] }}>{MEMBERS[s.from].initials}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 900, fontSize: 14, margin: 0 }}>
                        <span style={{ color: "#ff6b6b" }}>{MEMBERS[s.from].name}</span> owes <span style={{ color: "#51cf66" }}>{MEMBERS[s.to].name}</span>
                      </p>
                    </div>
                    <span className="bangers" style={{ fontSize: 22, color: "#ff6b6b" }}>${s.amount.toFixed(2)}</span>
                    <div className="avatar" style={{ background: AVATAR_COLORS[s.to] }}>{MEMBERS[s.to].initials}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#ff6b6b" }}><IconArrow /></div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "Balances" && (
              <div className="card">
                <div className="section-header">
                  <h3 className="bangers" style={{ fontSize: 20, margin: 0 }}>Everyone's Balance</h3>
                </div>
                {MEMBERS.map((m, i) => {
                  const b = balances[i];
                  const isPos = b > 0.01;
                  const isNeg = b < -0.01;
                  return (
                    <div key={m.name} className="expense-row">
                      <div className="avatar" style={{ background: AVATAR_COLORS[i] }}>{m.initials}</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 900, fontSize: 14, margin: 0 }}>{m.name}</p>
                        <p style={{ fontSize: 12, fontWeight: 700, color: "#888", margin: 0 }}>{isPos ? "is owed money" : isNeg ? "owes money" : "all square"}</p>
                      </div>
                      <span className="bangers" style={{ fontSize: 22, color: isPos ? "#51cf66" : isNeg ? "#ff6b6b" : "#aaa" }}>
                        {isPos ? "+" : ""}{b.toFixed(2) === "0.00" ? "$0" : `$${Math.abs(b).toFixed(2)}`}
                      </span>
                      <span className="badge" style={{ background: isPos ? "#e8fde8" : isNeg ? "#fde8e8" : "#f0ebe0", color: isPos ? "#51cf66" : isNeg ? "#ff6b6b" : "#aaa", borderColor: isPos ? "#51cf66" : isNeg ? "#ff6b6b" : "#ccc" }}>
                        {isPos ? "Gets back" : isNeg ? "Owes" : "Even"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <span className="comic-tag">Add it up! 💸</span>
                <h2 className="bangers" style={{ fontSize: 32, margin: "8px 0 4px" }}>New Expense</h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label className="form-label">What was it?</label>
                  <input className="form-input" type="text" placeholder="e.g. Dinner 🍽" value={form.desc} onChange={e => setForm(p => ({ ...p, desc: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">Amount ($)</label>
                  <input className="form-input" type="number" placeholder="0.00" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">Paid by</label>
                  <select className="form-input" value={form.paidBy} onChange={e => setForm(p => ({ ...p, paidBy: Number(e.target.value) }))} style={{ padding: "10px 14px" }}>
                    {MEMBERS.map((m, i) => <option key={i} value={i}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Split with</label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {MEMBERS.map((m, i) => (
                      <button key={i} onClick={() => toggleSplit(i)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", border: `3px solid ${form.splitWith.includes(i) ? "#ff6b6b" : "#ccc"}`, borderRadius: 50, background: form.splitWith.includes(i) ? "#fff8f8" : "#fff", cursor: "pointer", fontWeight: 800, fontSize: 13, boxShadow: form.splitWith.includes(i) ? "3px 3px 0 #ff6b6b" : "none", transition: "all 0.15s" }}>
                        <div style={{ width: 22, height: 22, background: AVATAR_COLORS[i], borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 900, color: "#fff" }}>{m.initials}</div>
                        {m.initials}
                      </button>
                    ))}
                  </div>
                </div>
                <button className="btn-primary" style={{ width: "100%", justifyContent: "center", fontSize: 20, padding: "14px", marginTop: 4 }} onClick={addExpense}>Add Expense 💸</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
