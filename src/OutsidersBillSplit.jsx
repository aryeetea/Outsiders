import { useEffect, useMemo, useState } from "react";
import { createId, getCurrentUserKey, getDisplayName, getVisibleGroupsForProfile } from "./appState";
import { sendNotificationEmails } from "./notificationEmail";
import OutsidersSideNav from "./OutsidersSideNav";
import { buildAppUrl } from "./siteConfig";
import { hydrateMembersWithProfileLinks, isSupabaseConfigured, supabase } from "./supabase";

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
    position: fixed;
    inset: 0;
    background-image: radial-gradient(circle, #1a1a2e 1px, transparent 1px);
    background-size: 24px 24px;
    opacity: 0.03;
    pointer-events: none;
    z-index: 0;
  }
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
    padding: 34px 34px 42px;
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
    gap: 22px;
    margin-bottom: 26px;
    position: relative;
    z-index: 1;
  }
  .bill-hero-top {
    display: flex;
    justify-content: space-between;
    gap: 18px;
    align-items: flex-start;
    flex-wrap: wrap;
  }
  .bill-kicker {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 10px 18px;
    background: #ffd54d;
    border: 4px solid #1a1a2e;
    border-radius: 12px;
    box-shadow: 0 6px 0 #1a1a2e;
    transform: rotate(-1.4deg);
    font: 400 clamp(16px, 2vw, 24px) 'Bangers', cursive;
    letter-spacing: 0.08em;
    width: fit-content;
  }
  .bill-title {
    margin: 10px 0 10px;
    font: 400 clamp(52px, 8vw, 92px) 'Bangers', cursive;
    line-height: 0.92;
    letter-spacing: 0.05em;
    color: #ff6b6b;
    text-shadow: 6px 0 0 #1a1a2e, 12px 0 0 rgba(255, 107, 107, 0.18);
    max-width: 9ch;
  }
  .bill-subtitle {
    margin: 0;
    max-width: 58ch;
    color: #4f5667;
    line-height: 1.65;
    font-weight: 800;
    font-size: 16px;
  }
  .hero-actions {
    display: grid;
    gap: 12px;
    justify-items: end;
    min-width: min(100%, 280px);
  }
  .hero-actions-card,
  .card,
  .stat-card,
  .member-card,
  .expense-card,
  .settlement-card,
  .payment-card {
    background: #fffdf7;
    border: 3px solid #1a1a2e;
    border-radius: 18px;
    box-shadow: 6px 6px 0 #1a1a2e;
    position: relative;
    overflow: hidden;
  }
  .hero-actions-card,
  .card { padding: 20px; }
  .hero-actions-card {
    width: min(320px, 100%);
    display: grid;
    gap: 12px;
    background: linear-gradient(180deg, #fffaf0 0%, #fff2cd 100%);
  }
  .section-label {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 8px 0 16px;
    color: #7a7687;
    font: 400 22px 'Bangers', cursive;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .section-label::before {
    content: "▸";
    font-size: 18px;
  }
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }
  .stat-card {
    padding: 18px;
    display: grid;
    gap: 8px;
    background: #fff;
  }
  .layout-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.9fr);
    gap: 20px;
  }
  .panel-stack,
  .side-stack,
  .expense-list,
  .settlement-list,
  .member-list,
  .form-stack {
    display: grid;
    gap: 16px;
  }
  .tab-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 18px;
  }
  .tab-btn,
  .btn-primary,
  .btn-secondary,
  .btn-outline,
  .mini-btn,
  .pill-btn {
    border: 3px solid #1a1a2e;
    cursor: pointer;
    transition: transform 0.14s ease, box-shadow 0.14s ease, background 0.14s ease;
  }
  .tab-btn:hover,
  .btn-primary:hover,
  .btn-secondary:hover,
  .btn-outline:hover,
  .mini-btn:hover,
  .pill-btn:hover {
    transform: translate(-1px, -2px);
  }
  .tab-btn:disabled,
  .btn-primary:disabled,
  .btn-secondary:disabled,
  .btn-outline:disabled,
  .mini-btn:disabled,
  .pill-btn:disabled {
    cursor: not-allowed;
    opacity: 0.48;
    transform: none;
    box-shadow: 2px 2px 0 rgba(26, 26, 46, 0.32);
  }
  .tab-btn {
    padding: 10px 16px;
    background: #fff2cb;
    color: #6f697c;
    border-radius: 999px;
    box-shadow: 3px 3px 0 #1a1a2e;
    font: 800 12px 'Nunito', sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .tab-btn.active {
    background: #17151f;
    color: #fff8dc;
    box-shadow: 4px 4px 0 #ff6b6b;
  }
  .btn-primary,
  .btn-secondary,
  .btn-outline,
  .mini-btn,
  .pill-btn {
    border-radius: 12px;
    font-family: 'Nunito', sans-serif;
    font-weight: 900;
  }
  .btn-primary {
    background: #ff6b6b;
    color: #fff;
    box-shadow: 4px 4px 0 #1a1a2e;
    padding: 12px 18px;
  }
  .btn-secondary {
    background: #ffd93d;
    color: #1a1a2e;
    box-shadow: 4px 4px 0 #1a1a2e;
    padding: 12px 18px;
  }
  .btn-outline {
    background: #fff;
    color: #1a1a2e;
    box-shadow: 3px 3px 0 #1a1a2e;
    padding: 11px 16px;
  }
  .mini-btn {
    background: #fff;
    color: #1a1a2e;
    box-shadow: 3px 3px 0 #1a1a2e;
    padding: 8px 12px;
    font-size: 12px;
  }
  .pill-btn {
    background: #fff8f1;
    color: #1a1a2e;
    box-shadow: 3px 3px 0 #1a1a2e;
    padding: 8px 12px;
    border-radius: 999px;
    font-size: 12px;
  }
  .pill-btn.active {
    background: #ffe6d5;
    box-shadow: 3px 3px 0 #ff9a3c;
    border-color: #ff9a3c;
  }
  .field {
    display: grid;
    gap: 8px;
  }
  .field label {
    font: 400 15px 'Bangers', cursive;
    letter-spacing: 0.05em;
    color: #1a1a2e;
  }
  .field input,
  .field select,
  .field textarea {
    width: 100%;
    border: 3px solid #1a1a2e;
    border-radius: 12px;
    padding: 12px 14px;
    background: #fffdf9;
    font: 800 14px 'Nunito', sans-serif;
    color: #1a1a2e;
    outline: none;
    box-shadow: 3px 3px 0 #1a1a2e;
  }
  .field input:focus,
  .field select:focus,
  .field textarea:focus {
    border-color: #ff6b6b;
    box-shadow: 3px 3px 0 #ff6b6b;
  }
  .field textarea {
    min-height: 96px;
    resize: vertical;
  }
  .stack-row,
  .between-row {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    align-items: center;
  }
  .between-row { justify-content: space-between; }
  .member-card,
  .expense-card,
  .settlement-card,
  .payment-card {
    padding: 16px;
    background: #fff;
  }
  .member-card {
    display: grid;
    gap: 14px;
  }
  .member-top,
  .expense-top,
  .settlement-top,
  .payment-top {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: flex-start;
    flex-wrap: wrap;
  }
  .avatar {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    border: 2.5px solid #1a1a2e;
    display: grid;
    place-items: center;
    font-weight: 900;
    font-size: 12px;
    color: #fff;
    flex-shrink: 0;
    box-shadow: 2px 2px 0 #1a1a2e;
  }
  .payment-badge,
  .status-badge,
  .share-badge,
  .category-badge {
    display: inline-flex;
    align-items: center;
    padding: 6px 10px;
    border-radius: 999px;
    border: 2px solid #1a1a2e;
    box-shadow: 2px 2px 0 #1a1a2e;
    font: 900 11px 'Nunito', sans-serif;
  }
  .payment-badge.missing {
    background: #fff3de;
    color: #9a6700;
  }
  .payment-badge.ready {
    background: #eefdf5;
    color: #0f766e;
  }
  .category-badge {
    background: #eef8ff;
    color: #155e75;
  }
  .status-badge.open {
    background: #fff0e6;
    color: #b54708;
  }
  .status-badge.done {
    background: #eefdf5;
    color: #0f766e;
  }
  .share-badge {
    background: #fff7da;
    color: #6b5b00;
  }
  .money-card {
    display: grid;
    gap: 12px;
    padding: 16px;
    background: linear-gradient(180deg, #fff 0%, #fff6e4 100%);
  }
  .empty-card {
    padding: 28px 22px;
    text-align: center;
    border-radius: 18px;
    border: 3px dashed rgba(26, 26, 46, 0.24);
    background: #fff9ec;
    display: grid;
    gap: 8px;
  }
  .empty-card p {
    margin: 0;
    color: #667085;
    font-weight: 800;
    line-height: 1.55;
  }
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(12, 10, 18, 0.5);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }
  .modal {
    background: #fffdf7;
    border: 4px solid #1a1a2e;
    border-radius: 22px;
    box-shadow: 10px 10px 0 #1a1a2e;
    padding: 30px 26px;
    width: min(560px, 100%);
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
  }
  .close-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: #f5f3ee;
    border: 2px solid #1a1a2e;
    box-shadow: 2px 2px 0 #1a1a2e;
    cursor: pointer;
  }
  .comic-tag {
    display: inline-flex;
    padding: 4px 12px;
    border-radius: 8px;
    background: #ffd93d;
    border: 2px solid #1a1a2e;
    box-shadow: 2px 2px 0 #1a1a2e;
    font: 400 12px 'Bangers', cursive;
    letter-spacing: 0.07em;
    transform: rotate(-2deg);
  }
  .two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }
  .split-grid {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .settlement-method {
    margin-top: 10px;
    padding: 12px 14px;
    border-radius: 12px;
    border: 2px dashed rgba(26, 26, 46, 0.24);
    background: #fff9ee;
    display: grid;
    gap: 4px;
  }
  .helper-copy {
    color: #667085;
    font-size: 12px;
    font-weight: 800;
    line-height: 1.5;
  }
  @media (max-width: 1100px) {
    .layout-grid { grid-template-columns: 1fr; }
    .summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .hero-actions {
      justify-items: stretch;
      width: 100%;
    }
    .hero-actions-card {
      width: 100%;
    }
  }
  @media (max-width: 720px) {
    .main { padding: 18px 14px; }
    .bill-shell { padding: 22px 16px 28px; }
    .summary-grid,
    .two-col { grid-template-columns: 1fr; }
    .tab-row,
    .stack-row,
    .between-row,
    .member-top,
    .expense-top,
    .settlement-top,
    .payment-top,
    .bill-hero-top { align-items: stretch; }
    .btn-primary,
    .btn-secondary,
    .btn-outline { width: 100%; justify-content: center; }
    .bill-kicker { width: 100%; justify-content: center; }
  }
`;

const AVATAR_COLORS = ["#ff6b6b", "#4ecdc4", "#a29bfe", "#ffd93d", "#51cf66", "#ff6b9d"];
const PAYMENT_TYPES = ["Venmo", "Cash App", "Zelle", "PayPal", "Apple Cash", "Cash", "Bank transfer"];
const EXPENSE_CATEGORIES = ["Food", "Transport", "Tickets", "Stay", "Supplies", "Other"];
const MAX_PAYMENT_METHODS_PER_MEMBER = 2;

function normalizeMemberKey(member = {}) {
  if (member.userId) return `user:${member.userId}`;
  if (member.username) return `username:${String(member.username).replace(/^@/, "").toLowerCase()}`;
  return `name:${String(member.name || "").trim().toLowerCase()}`;
}

function normalizeIdentityValue(value = "") {
  return String(value || "").replace(/^@/, "").trim().toLowerCase();
}

function getIdentityIds(value = {}) {
  return [
    value.id,
    value.userId,
    value.user_id,
    value.profileId,
    value.profile_id,
    value.uid,
  ]
    .map((item) => String(item || "").trim())
    .filter(Boolean);
}

function isCurrentUserMember(member = {}, profile = {}) {
  const memberSource = member.source || member;
  const profileIds = getIdentityIds(profile);
  const memberIds = getIdentityIds(memberSource);

  if (profileIds.length || memberIds.length) {
    return profileIds.length > 0 && memberIds.some((id) => profileIds.includes(id));
  }

  const profileUsername = normalizeIdentityValue(profile.username);
  const memberUsername = normalizeIdentityValue(memberSource.username);
  if (profileUsername || memberUsername) {
    return Boolean(profileUsername && profileUsername === memberUsername);
  }

  const profileEmail = normalizeIdentityValue(profile.email);
  const memberEmail = normalizeIdentityValue(memberSource.email);
  if (profileEmail || memberEmail) {
    return Boolean(profileEmail && profileEmail === memberEmail);
  }

  const profileName = normalizeIdentityValue(profile.name || profile.full_name);
  const memberName = normalizeIdentityValue(memberSource.name || memberSource.full_name);
  return Boolean(profileName && profileName === memberName);
}

function normalizePaymentMethod(value = {}) {
  const candidate = value && typeof value === "object" ? value : {};
  return {
    type: String(candidate.type || "").trim(),
    handle: String(candidate.handle || "").trim(),
    note: String(candidate.note || "").trim(),
  };
}

function normalizePaymentMethods(member = {}) {
  const rawMethods = Array.isArray(member.paymentMethods)
    ? member.paymentMethods
    : Array.isArray(member.payment_methods)
      ? member.payment_methods
      : [];
  const legacyMethod = normalizePaymentMethod(member.paymentMethod || member.payment_method);
  const methods = rawMethods.map(normalizePaymentMethod);
  if (hasPaymentMethod(legacyMethod) && !methods.some((method) => method.type === legacyMethod.type && method.handle === legacyMethod.handle)) {
    methods.unshift(legacyMethod);
  }
  return methods.filter(hasPaymentMethod).slice(0, MAX_PAYMENT_METHODS_PER_MEMBER);
}

function hasPaymentMethod(value = {}) {
  const method = normalizePaymentMethod(value);
  return Boolean(method.type && method.handle);
}

function formatPaymentMethod(method = {}) {
  const normalized = normalizePaymentMethod(method);
  if (!hasPaymentMethod(normalized)) return "";
  return `${normalized.type} · ${normalized.handle}`;
}

function initialsForMember(member = {}) {
  if (member.initials) return String(member.initials).slice(0, 3).toUpperCase();
  const name = String(member.name || "You").replace(/^@/, "").trim();
  return name.slice(0, 3).toUpperCase() || "YOU";
}

function getFallbackMembers() {
  return [{
    key: "local:you",
    name: "You",
    initials: "YOU",
    userId: null,
    username: "",
    email: "",
    paymentMethod: normalizePaymentMethod(),
    paymentMethods: [],
    source: { name: "You" },
  }];
}

function calcBalances(expenses, members) {
  const memberIndexByKey = new Map(members.map((member, index) => [member.key, index]));
  const balances = members.map(() => 0);

  expenses.filter((expense) => !expense.settled).forEach((expense) => {
    const splitKeys = Array.isArray(expense.splitWithKeys)
      ? expense.splitWithKeys.filter((key) => memberIndexByKey.has(key))
      : [];
    const paidByIndex = memberIndexByKey.get(expense.paidByKey);
    if (paidByIndex === undefined || !splitKeys.length) return;

    const share = expense.amount / splitKeys.length;
    splitKeys.forEach((key) => {
      const memberIndex = memberIndexByKey.get(key);
      if (memberIndex !== undefined) balances[memberIndex] -= share;
    });
    balances[paidByIndex] += expense.amount;
  });

  return balances;
}

function calcSettlements(balances) {
  const settlements = [];
  const positive = balances
    .map((balance, index) => ({ index, balance }))
    .filter((item) => item.balance > 0.01)
    .sort((a, b) => b.balance - a.balance);
  const negative = balances
    .map((balance, index) => ({ index, balance }))
    .filter((item) => item.balance < -0.01)
    .sort((a, b) => a.balance - b.balance);

  const creditors = positive.map((item) => ({ ...item }));
  const debtors = negative.map((item) => ({ ...item }));
  let creditorIndex = 0;
  let debtorIndex = 0;

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const amount = Math.min(creditors[creditorIndex].balance, -debtors[debtorIndex].balance);
    if (amount > 0.01) {
      settlements.push({
        from: debtors[debtorIndex].index,
        to: creditors[creditorIndex].index,
        amount: Math.round(amount * 100) / 100,
      });
    }

    creditors[creditorIndex].balance -= amount;
    debtors[debtorIndex].balance += amount;

    if (Math.abs(creditors[creditorIndex].balance) < 0.01) creditorIndex += 1;
    if (Math.abs(debtors[debtorIndex].balance) < 0.01) debtorIndex += 1;
  }

  return settlements;
}

function formatMoney(value = 0) {
  const amount = Number(value) || 0;
  return amount.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function formatDate(value = "") {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "Just now";
  return date.toLocaleString();
}

function getMemberColor(index = 0) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

function normalizeExpense(expense = {}) {
  return {
    id: expense.id || createId("expense"),
    desc: String(expense.desc || "").trim(),
    amount: Number(expense.amount) || 0,
    paidByKey: String(expense.paidByKey || ""),
    splitWithKeys: Array.isArray(expense.splitWithKeys) ? expense.splitWithKeys : [],
    settled: Boolean(expense.settled),
    emoji: expense.emoji || "💸",
    addedBy: expense.addedBy || "",
    createdAt: expense.createdAt || new Date().toISOString(),
    category: String(expense.category || "Other").trim(),
    note: String(expense.note || "").trim(),
  };
}

async function syncExpenseNotifications({
  group,
  members,
  actorProfile,
  subject,
  intro,
  message,
  details,
  type,
}) {
  if (!isSupabaseConfigured || !group?.id) return;

  const { members: resolvedMembers } = await hydrateMembersWithProfileLinks(members);
  const recipientRows = resolvedMembers
    .filter((member) => member.userId)
    .map((member) => ({
      user_id: member.userId,
      recipient: member.name,
      recipient_key: normalizeMemberKey(member),
      group_id: group.id,
      group_name: group.name,
      action_screen: "bill-split",
      action_params: { groupId: group.id },
      type,
      message,
      read: false,
    }));

  if (recipientRows.length) {
    const { error } = await supabase.from("notifications").insert(recipientRows);
    if (error) {
      console.warn("Expense notification sync failed:", error.message);
    }
  }

  try {
    await sendNotificationEmails({
      recipients: resolvedMembers
        .filter((member) => member.email)
        .map((member) => ({ email: member.email, name: member.name })),
      subject,
      intro,
      ctaLabel: "Open Bill Split",
      ctaUrl: buildAppUrl("bill-split", { groupId: group.id }),
      details,
      excludeEmails: [actorProfile?.email],
    });
  } catch (emailError) {
    console.warn("Expense email sync failed:", emailError.message);
  }
}

export default function OutsidersBillSplit({ onNavigate, appData, setAppData, routeParams = {} }) {
  const profile = useMemo(() => appData?.profile || {}, [appData?.profile]);
  const groups = useMemo(() => appData?.groups || [], [appData?.groups]);
  const visibleGroups = useMemo(() => getVisibleGroupsForProfile(groups, profile), [groups, profile]);
  const [selectedGroupId, setSelectedGroupId] = useState(routeParams?.groupId || visibleGroups[0]?.id || "");
  const [activeTab, setActiveTab] = useState("Expenses");
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingPaymentKey, setEditingPaymentKey] = useState("");
  const [expenseForm, setExpenseForm] = useState({
    desc: "",
    amount: "",
    category: "Food",
    note: "",
    paidBy: 0,
    splitWith: [0],
  });
  const [paymentDrafts, setPaymentDrafts] = useState([
    normalizePaymentMethod(),
    normalizePaymentMethod(),
  ]);

  useEffect(() => {
    if (!visibleGroups.length) {
      if (selectedGroupId) queueMicrotask(() => setSelectedGroupId(""));
      return;
    }

    if (!selectedGroupId || !visibleGroups.some((group) => String(group.id) === String(selectedGroupId))) {
      queueMicrotask(() => setSelectedGroupId(routeParams?.groupId || visibleGroups[0].id));
    }
  }, [routeParams?.groupId, selectedGroupId, visibleGroups]);

  const selectedGroup = useMemo(
    () => visibleGroups.find((group) => String(group.id) === String(selectedGroupId)) || visibleGroups[0] || null,
    [selectedGroupId, visibleGroups]
  );

  const members = useMemo(() => {
    const rawMembers = Array.isArray(selectedGroup?.members) && selectedGroup.members.length
      ? selectedGroup.members
      : getFallbackMembers();

    return rawMembers.map((member, index) => ({
      key: normalizeMemberKey(member),
      name: member.name || "Crew member",
      initials: initialsForMember(member),
      userId: member.userId || null,
      username: member.username || "",
      email: member.email || "",
      paymentMethod: normalizePaymentMethod(member.paymentMethod || member.payment_method),
      paymentMethods: normalizePaymentMethods(member),
      source: member,
      color: getMemberColor(index),
    }));
  }, [selectedGroup]);

  const currentUserKey = getCurrentUserKey(profile);
  const currentName = getDisplayName(profile);
  const expenses = useMemo(
    () => (Array.isArray(selectedGroup?.expenses) ? selectedGroup.expenses : []).map(normalizeExpense).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)),
    [selectedGroup]
  );
  const balances = calcBalances(expenses, members);
  const settlements = calcSettlements(balances);
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const unsettledTotal = expenses.filter((expense) => !expense.settled).reduce((sum, expense) => sum + expense.amount, 0);
  const activeSettlements = settlements.length;
  const paymentMethodsReady = members.filter((member) => member.paymentMethods.length).length;
  const splitPreviewCount = expenseForm.splitWith.length;
  const editingMember = members.find((member) => member.key === editingPaymentKey) || null;
  const canEditPaymentForMember = (member) => isCurrentUserMember(member, profile);

  async function persistGroup(nextGroup) {
    if (!selectedGroup) return false;

    if (isSupabaseConfigured && nextGroup.id && !String(nextGroup.id).startsWith("group-")) {
      const { error } = await supabase
        .from("groups")
        .update({
          members: nextGroup.members || [],
          expenses: nextGroup.expenses || [],
        })
        .eq("id", nextGroup.id);

      if (error) {
        console.warn("Could not sync bill split updates:", error.message);
        return false;
      }
    }

    setAppData?.((prev) => ({
      ...prev,
      groups: (prev.groups || []).map((group) => (
        String(group.id) === String(nextGroup.id) ? nextGroup : group
      )),
    }));

    return true;
  }

  async function savePaymentMethod() {
    if (!selectedGroup || !editingMember) return;
    if (!canEditPaymentForMember(editingMember)) {
      setEditingPaymentKey("");
      return;
    }

    const nextPaymentMethods = paymentDrafts
      .map(normalizePaymentMethod)
      .filter(hasPaymentMethod)
      .slice(0, MAX_PAYMENT_METHODS_PER_MEMBER);

    const nextMembers = (selectedGroup.members || []).map((member) => (
      normalizeMemberKey(member) === editingMember.key
        ? {
          ...member,
          paymentMethod: nextPaymentMethods[0] || normalizePaymentMethod(),
          paymentMethods: nextPaymentMethods,
        }
        : member
    ));

    const nextGroup = { ...selectedGroup, members: nextMembers };
    const saved = await persistGroup(nextGroup);
    if (!saved) return;
    setEditingPaymentKey("");
  }

  async function addExpense() {
    if (!selectedGroup || !expenseForm.desc.trim()) return;
    const amount = Number(expenseForm.amount);
    if (!Number.isFinite(amount) || amount <= 0) return;

    const paidByMember = members[Number(expenseForm.paidBy)];
    const splitWithKeys = expenseForm.splitWith
      .map((index) => members[index]?.key)
      .filter(Boolean);
    if (!paidByMember || !splitWithKeys.length) return;

    const nextExpense = {
      id: createId("expense"),
      desc: expenseForm.desc.trim(),
      amount,
      category: expenseForm.category || "Other",
      note: expenseForm.note.trim(),
      paidByKey: paidByMember.key,
      splitWithKeys,
      settled: false,
      emoji: expenseForm.category === "Food"
        ? "🍽"
        : expenseForm.category === "Transport"
        ? "🚗"
        : expenseForm.category === "Tickets"
        ? "🎟"
        : expenseForm.category === "Stay"
        ? "🏨"
        : expenseForm.category === "Supplies"
        ? "🛒"
        : "💸",
      addedBy: currentUserKey,
      createdAt: new Date().toISOString(),
    };

    const nextGroup = {
      ...selectedGroup,
      expenses: [...expenses, nextExpense],
    };
    const saved = await persistGroup(nextGroup);
    if (!saved) return;

    void syncExpenseNotifications({
      group: nextGroup,
      members: nextGroup.members || [],
      actorProfile: profile,
      subject: `${currentName} added an expense in ${nextGroup.name}`,
      intro: `${currentName} logged a new shared expense in ${nextGroup.name}.`,
      message: `${currentName} added ${nextExpense.desc} for ${formatMoney(nextExpense.amount)} in ${nextGroup.name}.`,
      details: [
        `Category: ${nextExpense.category}`,
        `Paid by: ${paidByMember.name}`,
        `Split with: ${splitWithKeys.length} member${splitWithKeys.length === 1 ? "" : "s"}`,
      ],
      type: "expense-added",
    });

    setExpenseForm({
      desc: "",
      amount: "",
      category: "Food",
      note: "",
      paidBy: 0,
      splitWith: [0],
    });
    setShowExpenseModal(false);
  }

  async function settleExpense(expenseId) {
    if (!selectedGroup) return;
    const targetExpense = expenses.find((expense) => expense.id === expenseId);
    if (!targetExpense) return;

    const nextGroup = {
      ...selectedGroup,
      expenses: expenses.map((expense) => (
        expense.id === expenseId ? { ...expense, settled: true } : expense
      )),
    };
    const saved = await persistGroup(nextGroup);
    if (!saved) return;

    void syncExpenseNotifications({
      group: nextGroup,
      members: nextGroup.members || [],
      actorProfile: profile,
      subject: `${targetExpense.desc} was settled in ${nextGroup.name}`,
      intro: `${currentName} marked ${targetExpense.desc} as settled in ${nextGroup.name}.`,
      message: `${currentName} settled ${targetExpense.desc} in ${nextGroup.name}.`,
      details: [
        `Expense: ${targetExpense.desc}`,
        `Amount: ${formatMoney(targetExpense.amount)}`,
      ],
      type: "expense-settled",
    });
  }

  function toggleSplit(index) {
    setExpenseForm((previous) => ({
      ...previous,
      splitWith: previous.splitWith.includes(index)
        ? previous.splitWith.filter((value) => value !== index)
        : [...previous.splitWith, index].sort((a, b) => a - b),
    }));
  }

  const profileName = profile.name || profile.username || "You";

  function startEditingPayment(member) {
    if (!canEditPaymentForMember(member)) return;

    const methods = normalizePaymentMethods(member);
    setPaymentDrafts([
      methods[0] || normalizePaymentMethod(),
      methods[1] || normalizePaymentMethod(),
    ]);
    setEditingPaymentKey(member.key);
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="root">
        <OutsidersSideNav
          activeLabel="Bill Split"
          onNavigate={onNavigate}
          profileName={profileName}
          notificationCount={(appData?.notifications || []).filter((item) => !item.read).length}
          appData={appData}
          setAppData={setAppData}
        >
          <main className="main">
            <section className="bill-shell">
              <div className="bill-hero">
                <div className="bill-hero-top">
                  <div>
                    <div className="bill-kicker">
                      <span>💸</span>
                      <span>Money HQ</span>
                      <span>💸</span>
                    </div>
                    <h1 className="bill-title">Bill Split</h1>
                    <p className="bill-subtitle">
                      Keep the comic-book energy, but make the money side actually feel organized. Everyone in the crew can log expenses, set a payment method, and know exactly how to settle up.
                    </p>
                  </div>

                  <div className="hero-actions">
                    <div className="hero-actions-card">
                      <div className="field">
                        <label>Crew roster</label>
                        <select value={selectedGroup?.id || ""} onChange={(event) => setSelectedGroupId(event.target.value)}>
                          {visibleGroups.length
                            ? visibleGroups.map((group) => (
                                <option key={group.id} value={group.id}>
                                  {group.emoji} {group.name}
                                </option>
                              ))
                            : <option value="">No crew yet</option>}
                        </select>
                      </div>
                      <div className="stack-row">
                        <button type="button" className="btn-primary" onClick={() => setShowExpenseModal(true)}>
                          Add expense
                        </button>
                        <button type="button" className="btn-outline" onClick={() => setActiveTab("Members")}>
                          Set payment methods
                        </button>
                      </div>
                      <p className="helper-copy" style={{ margin: 0 }}>
                        {selectedGroup
                          ? `Working inside ${selectedGroup.name}. Any updates here stay shared with the whole crew.`
                          : "Create or join a crew first so shared expenses have somewhere to live."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="section-label">Money Snapshot</div>
              <div className="summary-grid">
                {[
                  { label: "Total spent", value: formatMoney(totalSpent), color: "#ff9a3c", bg: "#fff3e3" },
                  { label: "Still open", value: formatMoney(unsettledTotal), color: "#ff6b9d", bg: "#fff0f5" },
                  { label: "Settle moves", value: activeSettlements, color: "#4ecdc4", bg: "#ebfaff" },
                  { label: "Payment profiles", value: `${paymentMethodsReady}/${members.length}`, color: "#51cf66", bg: "#eefdf5" },
                ].map((item) => (
                  <div key={item.label} className="stat-card" style={{ background: item.bg, borderColor: item.color, boxShadow: `4px 4px 0 ${item.color}` }}>
                    <p style={{ margin: 0, textTransform: "uppercase", fontSize: 12, fontWeight: 900, color: "#777" }}>{item.label}</p>
                    <p className="bangers" style={{ margin: 0, fontSize: 30, color: item.color }}>{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="layout-grid">
                <div className="panel-stack">
                  <div className="card">
                    <div className="tab-row">
                      {["Expenses", "Settle Up", "Balances", "Members"].map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                          onClick={() => setActiveTab(tab)}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>

                    {activeTab === "Expenses" ? (
                      <div className="expense-list">
                        {expenses.length ? expenses.map((expense) => {
                          const payer = members.find((member) => member.key === expense.paidByKey);
                          return (
                            <article key={expense.id} className="expense-card">
                              <div className="expense-top">
                                <div className="stack-row">
                                  <div style={{ width: 48, height: 48, borderRadius: 14, border: "3px solid #1a1a2e", display: "grid", placeItems: "center", background: "#fff7e0", boxShadow: "3px 3px 0 #1a1a2e", fontSize: 22 }}>
                                    {expense.emoji}
                                  </div>
                                  <div>
                                    <strong style={{ display: "block", fontSize: 16 }}>{expense.desc}</strong>
                                    <div className="stack-row" style={{ gap: 8, marginTop: 6 }}>
                                      <span className="category-badge">{expense.category}</span>
                                      <span className={`status-badge ${expense.settled ? "done" : "open"}`}>
                                        {expense.settled ? "Settled" : "Open"}
                                      </span>
                                      <span className="share-badge">Split {expense.splitWithKeys.length} ways</span>
                                    </div>
                                  </div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                  <div className="bangers" style={{ fontSize: 28, color: expense.settled ? "#9aa0ab" : "#ff6b6b" }}>
                                    {formatMoney(expense.amount)}
                                  </div>
                                  <div className="helper-copy">Added {formatDate(expense.createdAt)}</div>
                                </div>
                              </div>
                              <div className="between-row">
                                <div>
                                  <strong style={{ display: "block", fontSize: 13 }}>Paid by {payer?.name || "Unknown"}</strong>
                                  <div className="helper-copy">
                                    {expense.note || "No note added for this expense."}
                                  </div>
                                </div>
                                {!expense.settled ? (
                                  <button type="button" className="btn-secondary" onClick={() => void settleExpense(expense.id)}>
                                    Mark settled
                                  </button>
                                ) : null}
                              </div>
                            </article>
                          );
                        }) : (
                          <div className="empty-card">
                            <strong>No expenses yet.</strong>
                            <p>Start with one shared expense and the balances, settle-up guidance, and crew payment methods will all sync underneath it.</p>
                          </div>
                        )}
                      </div>
                    ) : null}

                    {activeTab === "Settle Up" ? (
                      <div className="settlement-list">
                        {settlements.length ? settlements.map((settlement, index) => {
                          const fromMember = members[settlement.from];
                          const toMember = members[settlement.to];
                          const paymentMethods = toMember?.paymentMethods || [];
                          const primaryPaymentMethod = paymentMethods[0] || normalizePaymentMethod();
                          return (
                            <article key={`${settlement.from}-${settlement.to}-${index}`} className="settlement-card">
                              <div className="settlement-top">
                                <div>
                                  <strong style={{ display: "block", fontSize: 16 }}>
                                    {fromMember?.name || "Someone"} owes {toMember?.name || "someone else"}
                                  </strong>
                                  <div className="helper-copy">
                                    This is the cleanest next move based on the crew's open expenses.
                                  </div>
                                </div>
                                <div className="bangers" style={{ fontSize: 30, color: "#ff6b6b" }}>
                                  {formatMoney(settlement.amount)}
                                </div>
                              </div>
                              <div className="stack-row">
                                <div className="avatar" style={{ background: fromMember?.color || "#ff6b6b" }}>{fromMember?.initials || "??"}</div>
                                <span style={{ fontWeight: 900, color: "#ff6b6b" }}>{fromMember?.name || "Member"}</span>
                                <span style={{ fontWeight: 900, color: "#667085" }}>→</span>
                                <div className="avatar" style={{ background: toMember?.color || "#51cf66" }}>{toMember?.initials || "??"}</div>
                                <span style={{ fontWeight: 900, color: "#0f766e" }}>{toMember?.name || "Member"}</span>
                              </div>
                              <div className="settlement-method">
                                <strong style={{ fontSize: 13 }}>
                                  {hasPaymentMethod(primaryPaymentMethod)
                                    ? `Pay with ${primaryPaymentMethod.type}`
                                    : "Payment method not set yet"}
                                </strong>
                                <div className="helper-copy">
                                  {hasPaymentMethod(primaryPaymentMethod)
                                    ? `${primaryPaymentMethod.handle}${primaryPaymentMethod.note ? ` · ${primaryPaymentMethod.note}` : ""}${paymentMethods.length > 1 ? ` · +${paymentMethods.length - 1} more` : ""}`
                                    : `Ask ${toMember?.name || "this crew member"} to add a payment method in the Members tab.`}
                                </div>
                              </div>
                            </article>
                          );
                        }) : (
                          <div className="empty-card">
                            <strong>All settled up.</strong>
                            <p>Nobody owes anyone anything right now. Once new expenses come in, this section will map out the simplest payback path.</p>
                          </div>
                        )}
                      </div>
                    ) : null}

                    {activeTab === "Balances" ? (
                      <div className="settlement-list">
                        {members.map((member, index) => {
                          const balance = balances[index];
                          const positive = balance > 0.01;
                          const negative = balance < -0.01;
                          return (
                            <article key={member.key} className="money-card">
                              <div className="between-row">
                                <div className="stack-row">
                                  <div className="avatar" style={{ background: member.color }}>{member.initials}</div>
                                  <div>
                                    <strong style={{ display: "block", fontSize: 15 }}>{member.name}</strong>
                                    <div className="helper-copy">
                                      {positive ? "Should get money back" : negative ? "Still owes money" : "Even right now"}
                                    </div>
                                  </div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                  <div className="bangers" style={{ fontSize: 28, color: positive ? "#51cf66" : negative ? "#ff6b6b" : "#9aa0ab" }}>
                                    {positive ? "+" : negative ? "-" : ""}{formatMoney(Math.abs(balance))}
                                  </div>
                                  <span className={`payment-badge ${positive || negative ? "ready" : "missing"}`}>
                                    {positive ? "Gets back" : negative ? "Owes" : "Even"}
                                  </span>
                                </div>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    ) : null}

                    {activeTab === "Members" ? (
                      <div className="member-list">
                        {members.map((member) => {
                          const paymentMethods = member.paymentMethods || [];
                          const canEditPayment = canEditPaymentForMember(member);
                          return (
                            <article key={member.key} className="member-card">
                              <div className="member-top">
                                <div className="stack-row">
                                  <div className="avatar" style={{ background: member.color }}>{member.initials}</div>
                                  <div>
                                    <strong style={{ display: "block", fontSize: 15 }}>{member.name}</strong>
                                    <div className="helper-copy">
                                      {paymentMethods.length
                                        ? paymentMethods.map(formatPaymentMethod).join(" / ")
                                        : "No payment method saved yet"}
                                    </div>
                                  </div>
                                </div>
                                <span className={`payment-badge ${paymentMethods.length ? "ready" : "missing"}`}>
                                  {paymentMethods.length ? `${paymentMethods.length}/${MAX_PAYMENT_METHODS_PER_MEMBER} saved` : "Needs setup"}
                                </span>
                              </div>
                              {paymentMethods.map((method, methodIndex) => (
                                method.note ? <div key={`${method.type}-${method.handle}-${methodIndex}`} className="helper-copy">{method.note}</div> : null
                              ))}
                              {canEditPayment ? (
                                <div className="stack-row">
                                  <button type="button" className="mini-btn" onClick={() => startEditingPayment(member)}>
                                    Edit my payment method
                                  </button>
                                </div>
                              ) : null}
                            </article>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="side-stack">
                  <div className="card">
                    <div className="section-label" style={{ marginTop: 0 }}>Crew Pay Setup</div>
                    <div className="helper-copy" style={{ marginBottom: 12 }}>
                      Each person can save up to {MAX_PAYMENT_METHODS_PER_MEMBER} payment methods.
                    </div>
                    <div className="member-list">
                      {members.map((member) => {
                        const paymentMethods = member.paymentMethods || [];
                        const canEditPayment = canEditPaymentForMember(member);
                        return (
                          <div key={member.key} className="payment-card">
                            <div className="payment-top">
                              <div className="stack-row">
                                <div className="avatar" style={{ background: member.color }}>{member.initials}</div>
                                <div>
                                  <strong style={{ display: "block", fontSize: 14 }}>{member.name}</strong>
                                  <div className="helper-copy">
                                    {paymentMethods.length ? paymentMethods.map(formatPaymentMethod).join(" / ") : "Missing a payment path"}
                                  </div>
                                </div>
                              </div>
                              {canEditPayment ? (
                                <button
                                  type="button"
                                  className="mini-btn"
                                  onClick={() => startEditingPayment(member)}
                                  title="Edit my payment methods"
                                >
                                  {paymentMethods.length ? "Edit" : "Add"}
                                </button>
                              ) : null}
                            </div>
                            <div className="helper-copy" style={{ marginTop: 8 }}>
                              {paymentMethods.length}/{MAX_PAYMENT_METHODS_PER_MEMBER} saved for this person.
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="card">
                    <div className="section-label" style={{ marginTop: 0 }}>How This Works</div>
                    <div className="form-stack">
                      <div className="helper-copy">1. Anyone in the crew adds what they paid for.</div>
                      <div className="helper-copy">2. Each member saves how they prefer to get paid back.</div>
                      <div className="helper-copy">3. Settle Up shows the cleanest path instead of making everyone do mental math.</div>
                      <div className="helper-copy">4. Expense activity also lands in the shared notification center and email flow.</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </OutsidersSideNav>

        {showExpenseModal ? (
          <div className="modal-overlay" onClick={() => setShowExpenseModal(false)}>
            <div className="modal" onClick={(event) => event.stopPropagation()}>
              <button type="button" className="close-btn" onClick={() => setShowExpenseModal(false)}>✕</button>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <span className="comic-tag">Add it up</span>
                <h2 className="bangers" style={{ fontSize: 34, margin: "10px 0 6px" }}>New Expense</h2>
                <p className="helper-copy" style={{ margin: 0 }}>
                  This feeds the crew balances, the settle-up list, and the shared activity feed.
                </p>
              </div>
              <div className="form-stack">
                <div className="field">
                  <label>What was it?</label>
                  <input
                    type="text"
                    placeholder="Dinner, gas, museum tickets..."
                    value={expenseForm.desc}
                    onChange={(event) => setExpenseForm((previous) => ({ ...previous, desc: event.target.value }))}
                  />
                </div>
                <div className="two-col">
                  <div className="field">
                    <label>Amount</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={expenseForm.amount}
                      onChange={(event) => setExpenseForm((previous) => ({ ...previous, amount: event.target.value }))}
                    />
                  </div>
                  <div className="field">
                    <label>Category</label>
                    <select
                      value={expenseForm.category}
                      onChange={(event) => setExpenseForm((previous) => ({ ...previous, category: event.target.value }))}
                    >
                      {EXPENSE_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
                    </select>
                  </div>
                </div>
                <div className="field">
                  <label>Paid by</label>
                  <select
                    value={expenseForm.paidBy}
                    onChange={(event) => setExpenseForm((previous) => ({ ...previous, paidBy: Number(event.target.value) }))}
                  >
                    {members.map((member, index) => <option key={member.key} value={index}>{member.name}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Split with</label>
                  <div className="split-grid">
                    {members.map((member, index) => (
                      <button
                        key={member.key}
                        type="button"
                        className={`pill-btn ${expenseForm.splitWith.includes(index) ? "active" : ""}`}
                        onClick={() => toggleSplit(index)}
                      >
                        {member.initials}
                      </button>
                    ))}
                  </div>
                  <div className="helper-copy">
                    Currently splitting this {splitPreviewCount} way{splitPreviewCount === 1 ? "" : "s"}.
                  </div>
                </div>
                <div className="field">
                  <label>Quick note</label>
                  <textarea
                    placeholder="Optional context, like who it covered or why it matters."
                    value={expenseForm.note}
                    onChange={(event) => setExpenseForm((previous) => ({ ...previous, note: event.target.value }))}
                  />
                </div>
                <button type="button" className="btn-primary" onClick={() => void addExpense()}>
                  Add expense
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {editingMember ? (
          <div className="modal-overlay" onClick={() => setEditingPaymentKey("")}>
            <div className="modal" onClick={(event) => event.stopPropagation()}>
              <button type="button" className="close-btn" onClick={() => setEditingPaymentKey("")}>✕</button>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <span className="comic-tag">Payback path</span>
                <h2 className="bangers" style={{ fontSize: 34, margin: "10px 0 6px" }}>Payment Methods</h2>
                <p className="helper-copy" style={{ margin: 0 }}>
                  Save up to {MAX_PAYMENT_METHODS_PER_MEMBER} ways {editingMember.name} prefers to receive money.
                </p>
              </div>
              <div className="form-stack">
                {paymentDrafts.map((draft, draftIndex) => (
                  <div key={`payment-draft-${draftIndex}`} className="payment-card">
                    <div className="section-label" style={{ marginTop: 0 }}>Method {draftIndex + 1}</div>
                    <div className="field">
                      <label>Payment type</label>
                      <select
                        value={draft.type}
                        onChange={(event) => setPaymentDrafts((previous) => previous.map((method, index) => (
                          index === draftIndex ? { ...method, type: event.target.value } : method
                        )))}
                      >
                        <option value="">Choose one</option>
                        {PAYMENT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </div>
                    <div className="field">
                      <label>Handle or destination</label>
                      <input
                        type="text"
                        placeholder="@handle, phone number, or email"
                        value={draft.handle}
                        onChange={(event) => setPaymentDrafts((previous) => previous.map((method, index) => (
                          index === draftIndex ? { ...method, handle: event.target.value } : method
                        )))}
                      />
                    </div>
                    <div className="field">
                      <label>Extra note</label>
                      <textarea
                        placeholder="Optional note, like 'use this phone number' or 'cash only in person'."
                        value={draft.note}
                        onChange={(event) => setPaymentDrafts((previous) => previous.map((method, index) => (
                          index === draftIndex ? { ...method, note: event.target.value } : method
                        )))}
                      />
                    </div>
                    {hasPaymentMethod(draft) ? (
                      <button
                        type="button"
                        className="btn-outline"
                        onClick={() => setPaymentDrafts((previous) => previous.map((method, index) => (
                          index === draftIndex ? normalizePaymentMethod() : method
                        )))}
                      >
                        Clear method {draftIndex + 1}
                      </button>
                    ) : null}
                  </div>
                ))}
                <button type="button" className="btn-primary" onClick={() => void savePaymentMethod()}>
                  Save payment methods
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
