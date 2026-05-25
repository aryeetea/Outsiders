import { useEffect, useMemo, useState } from "react";
import { getVisibleGroupsForProfile } from "./appState";
import OutsidersSideNav from "./OutsidersSideNav";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Nunito:wght@400;600;700;800;900&display=swap');
  * { box-sizing: border-box; }
  body { background: #f5f3ee; margin: 0; }
  .root { font-family: 'Nunito', sans-serif; background: #f5f3ee; color: #1a1a2e; min-height: 100vh; display: flex; flex-direction: column; }
  .root::before { content: ''; position: fixed; inset: 0; background-image: radial-gradient(circle, #1a1a2e 1px, transparent 1px); background-size: 24px 24px; opacity: 0.03; pointer-events: none; z-index: 0; }
  .bangers { font-family: 'Bangers', cursive; letter-spacing: 0.04em; }
  .main { flex: 1; padding: 28px 32px; overflow-y: auto; }
  .bill-shell {
    background:
      radial-gradient(circle, rgba(201, 179, 104, 0.42) 1.4px, transparent 1.5px),
      linear-gradient(180deg, #fff9ea 0%, #fff6df 100%);
    background-size: 36px 36px, 100% 100%;
    border: 5px solid #1a1a2e;
    border-radius: 28px;
    box-shadow: 0 0 0 4px rgba(255,255,255,0.45) inset;
    padding: 36px 42px 54px;
    position: relative;
    overflow: hidden;
  }
  .bill-shell::before {
    content: '';
    position: absolute;
    inset: 16px;
    border: 2px solid rgba(26, 26, 46, 0.08);
    border-radius: 22px;
    pointer-events: none;
  }
  .bill-hero {
    display: grid;
    justify-items: center;
    gap: 22px;
    text-align: center;
    margin-bottom: 30px;
    position: relative;
    z-index: 1;
    max-width: 980px;
    margin-left: auto;
    margin-right: auto;
  }
  .bill-kicker {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    min-width: min(100%, 320px);
    padding: 12px 24px;
    background: #ffd54d;
    border: 5px solid #1a1a2e;
    border-radius: 12px;
    box-shadow: 0 6px 0 #1a1a2e;
    transform: rotate(-1.5deg);
    font: 400 clamp(18px, 2.2vw, 28px) 'Bangers', cursive;
    letter-spacing: 0.08em;
  }
  .bill-title {
    margin: 0;
    font: 400 clamp(52px, 9vw, 96px) 'Bangers', cursive;
    line-height: 0.92;
    letter-spacing: 0.05em;
    color: #ff6b6b;
    text-shadow: 6px 0 0 #1a1a2e, 12px 0 0 rgba(255, 107, 107, 0.18);
  }
  .bill-subtitle {
    position: relative;
    background: #fff;
    border: 5px solid #1a1a2e;
    border-radius: 999px;
    box-shadow: 6px 6px 0 #1a1a2e;
    padding: 16px 32px;
    font: 800 clamp(18px, 2vw, 26px) 'Nunito', sans-serif;
  }
  .bill-subtitle::after {
    content: '';
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
  .bill-actions {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    justify-content: center;
  }
  .bill-section-label {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 8px 0 18px;
    color: #888a95;
    font: 400 22px 'Bangers', cursive;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .bill-section-label::before {
    content: "▸";
    font-size: 18px;
  }
  .bill-summary-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }
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
  @media (max-width: 1024px) {
    .main { padding: 24px 20px; }
    .bill-shell { padding: 28px 22px 36px; }
    .bill-summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @media (max-width: 640px) {
    .main { padding: 18px 14px; }
    .section-header, .expense-row, .settle-row { align-items: flex-start; flex-wrap: wrap; }
    .bill-kicker { min-width: 0; width: 100%; }
    .bill-subtitle { padding: 14px 20px; }
    .bill-summary-grid { grid-template-columns: 1fr; }
  }
`;

const AVATAR_COLORS = ["#ff6b6b", "#4ecdc4", "#a29bfe", "#ffd93d", "#51cf66", "#ff6b9d"];
const INITIAL_EXPENSES = [];

const IconPlus = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconArrow = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;

function calcBalances(expenses, members) {
  const balances = members.map(() => 0);
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

function countMemberVotes(votes = {}, memberName) {
  return Object.values(votes).filter((value) => value === memberName).length;
}

function getLeaderFromMemberVotes(members = [], votes = {}) {
  const ranked = members
    .map((member) => ({ name: member.name, votes: countMemberVotes(votes, member.name) }))
    .sort((a, b) => b.votes - a.votes || a.name.localeCompare(b.name));

  const top = ranked[0];
  const runnerUp = ranked[1];

  if (!top || top.votes === 0) return null;
  if (runnerUp && runnerUp.votes === top.votes) {
    return { name: "", votes: top.votes, isTie: true };
  }
  return { name: top.name, votes: top.votes, isTie: false };
}

function getFallbackMembers() {
  return [{ initials: "YOU", name: "You" }];
}

export default function OutsidersBillSplit({ onNavigate, appData, setAppData }) {
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
  const [showModal, setShowModal] = useState(false);
  const profile = useMemo(() => appData?.profile || {}, [appData?.profile]);
  const groups = useMemo(() => getVisibleGroupsForProfile(appData?.groups || [], profile), [appData?.groups, profile]);
  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id || "");
  const [form, setForm] = useState({ desc: "", amount: "", paidBy: 0, splitWith: [0] });
  const [activeTab, setActiveTab] = useState("Expenses");

  const selectedGroup = useMemo(
    () => groups.find((group) => String(group.id) === String(selectedGroupId)) || groups[0] || null,
    [groups, selectedGroupId]
  );
  useEffect(() => {
    if (!groups.length && selectedGroupId) {
      queueMicrotask(() => setSelectedGroupId(""));
      return;
    }
    if (groups.length && (!selectedGroupId || !groups.some((group) => String(group.id) === String(selectedGroupId)))) {
      queueMicrotask(() => setSelectedGroupId(groups[0].id));
    }
  }, [groups, selectedGroupId]);
  const members = useMemo(
    () => (selectedGroup?.members?.length ? selectedGroup.members.map((member) => ({
      initials: member.initials || member.name?.slice(0, 3)?.toUpperCase() || "??",
      name: member.name,
    })) : getFallbackMembers()),
    [selectedGroup]
  );
  const selectedBillWatch = selectedGroup?.billWatch || { electedMemberName: "", votes: {}, checklist: [] };
  const billWatchVoteEntries = Object.entries(selectedBillWatch.votes || {});
  const billWatchLeader = getLeaderFromMemberVotes(selectedGroup?.members || [], selectedBillWatch.votes || {});

  const balances = calcBalances(expenses, members);
  const settlements = calcSettlements(balances);
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const unsettled = expenses.filter(e => !e.settled).reduce((s, e) => s + e.amount, 0);

  const addExpense = () => {
    if (!form.desc.trim() || !form.amount) return;
    setExpenses(prev => [...prev, { id: Date.now(), desc: form.desc, amount: Number(form.amount), paidBy: Number(form.paidBy), splitWith: form.splitWith, settled: false, emoji: "💸" }]);
    setForm({ desc: "", amount: "", paidBy: 0, splitWith: [0] });
    setShowModal(false);
  };

  const settleUp = (expId) => setExpenses(prev => prev.map(e => e.id === expId ? { ...e, settled: true } : e));
  const toggleSplit = (i) => setForm(prev => ({ ...prev, splitWith: prev.splitWith.includes(i) ? prev.splitWith.filter(x => x !== i) : [...prev.splitWith, i] }));
  const profileName = profile.name || profile.username || "You";

  return (
    <>
      <style>{STYLES}</style>
      <div className="root">
        <OutsidersSideNav activeLabel="Bill Split" onNavigate={onNavigate} profileName={profileName} notificationCount={(appData?.notifications || []).filter((n) => !n.read).length} appData={appData} setAppData={setAppData}>
          <main className="main">
            <section className="bill-shell">
            <div className="bill-hero">
              <div className="bill-kicker">
                <span>💸</span>
                <span>Split It Fair</span>
                <span>💸</span>
              </div>
              <h1 className="bill-title">Bill Split</h1>
              <div className="bill-subtitle">
                {selectedGroup ? "Track spending, payouts, and who still owes what." : "No expenses are loaded until you add them."}
              </div>
              <div className="bill-actions">
                <button className="btn-primary" onClick={() => setShowModal(true)}><IconPlus /> Add Expense</button>
              </div>
            </div>

            <div className="bill-section-label">Crew Tracker</div>
            <div className="card" style={{ background: "#e8f4fd", borderColor: "#4ecdc4", boxShadow: "5px 5px 0 #4ecdc4", marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 240 }}>
                  <p className="bangers" style={{ fontSize: 18, margin: "0 0 6px" }}>Bill Watch Roster 🧮</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#555", margin: "0 0 10px" }}>
                    This is where you can see who your crew voted to track payments and keep the split math clean.
                  </p>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                    <span className="badge" style={{ background: "#fff", color: "#4ecdc4", borderColor: "#4ecdc4" }}>
                      {billWatchLeader?.isTie ? `Tie at ${billWatchLeader.votes} vote${billWatchLeader.votes === 1 ? "" : "s"}` : (billWatchLeader?.name ? `${billWatchLeader.name} leading` : "No vote yet")}
                    </span>
                    <span className="badge" style={{ background: "#fff", color: "#1a1a2e", borderColor: "#1a1a2e" }}>
                      {billWatchVoteEntries.length} total vote{billWatchVoteEntries.length === 1 ? "" : "s"}
                    </span>
                    <span className="badge" style={{ background: "#fff", color: "#ff9a3c", borderColor: "#ff9a3c" }}>
                      Tracker: {selectedBillWatch.electedMemberName || (billWatchLeader?.isTie ? "Tie vote right now" : "Not assigned yet")}
                    </span>
                  </div>
                  {(selectedBillWatch.checklist || []).length > 0 ? (
                    <div>
                      {(selectedBillWatch.checklist || []).map((item) => (
                        <p key={item} style={{ fontSize: 12, fontWeight: 800, color: "#555", margin: "0 0 6px" }}>• {item}</p>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: 12, fontWeight: 800, color: "#777", margin: 0 }}>
                      No money-job checklist yet. Set it up in Friend Groups under Bill Watch.
                    </p>
                  )}
                </div>

                <div style={{ minWidth: 240, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div>
                    <label className="form-label">Crew roster</label>
                    <select className="form-input" value={selectedGroup?.id || ""} onChange={(event) => setSelectedGroupId(event.target.value)} style={{ padding: "10px 14px" }}>
                      {groups.length === 0 ? <option value="">No crew yet</option> : groups.map((group) => (
                        <option key={group.id} value={group.id}>{group.emoji} {group.name}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ background: "#fff", border: "3px solid #1a1a2e", borderRadius: 12, padding: "12px 14px", boxShadow: "3px 3px 0 #1a1a2e" }}>
                    <p className="bangers" style={{ fontSize: 14, margin: "0 0 8px" }}>Vote board</p>
                    {selectedGroup?.members?.length ? selectedGroup.members.map((member) => {
                      const voteCount = countMemberVotes(selectedBillWatch.votes, member.name);
                      return (
                        <div key={member.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                          <span style={{ fontSize: 12, fontWeight: 900, color: "#1a1a2e" }}>{member.name}</span>
                          <span style={{ fontSize: 12, fontWeight: 800, color: "#666" }}>{voteCount} vote{voteCount === 1 ? "" : "s"}</span>
                        </div>
                      );
                    }) : <p style={{ fontSize: 12, fontWeight: 800, color: "#888", margin: 0 }}>Create a crew first to see the voted record keeper.</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="bill-section-label">Money Snapshot</div>
            <div className="bill-summary-grid">
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

            <div className="bill-section-label">View Mode</div>
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
                {expenses.length === 0 ? (
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#888", margin: 0 }}>No expenses yet. Add one when something needs splitting.</p>
                ) : expenses.map(e => (
                  <div key={e.id} className="expense-row">
                    <div style={{ width: 44, height: 44, background: e.settled ? "#f0ebe0" : "#fff4e6", border: `3px solid ${e.settled ? "#ccc" : "#ff9a3c"}`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: `3px 3px 0 ${e.settled ? "#ccc" : "#ff9a3c"}`, flexShrink: 0 }}>{e.emoji}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 900, fontSize: 14, margin: 0, color: e.settled ? "#aaa" : "#1a1a2e", textDecoration: e.settled ? "line-through" : "none" }}>{e.desc}</p>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#888", margin: 0 }}>Paid by {members[e.paidBy].initials} · Split {e.splitWith.length} ways</p>
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
                    <div className="avatar" style={{ background: AVATAR_COLORS[s.from] }}>{members[s.from].initials}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 900, fontSize: 14, margin: 0 }}>
                        <span style={{ color: "#ff6b6b" }}>{members[s.from].name}</span> owes <span style={{ color: "#51cf66" }}>{members[s.to].name}</span>
                      </p>
                    </div>
                    <span className="bangers" style={{ fontSize: 22, color: "#ff6b6b" }}>${s.amount.toFixed(2)}</span>
                    <div className="avatar" style={{ background: AVATAR_COLORS[s.to] }}>{members[s.to].initials}</div>
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
                {members.map((m, i) => {
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
            </section>
          </main>
        </OutsidersSideNav>

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
                    {members.map((m, i) => <option key={i} value={i}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Split with</label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {members.map((m, i) => (
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
