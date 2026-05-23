import { useMemo, useState } from "react";
import { createOpenAIResponse, DEFAULT_OPENAI_MODEL } from "./openaiResponses";
import { buildHangoutInviteLink } from "./siteConfig";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Nunito:wght@400;600;700;800;900&display=swap');

  * { box-sizing: border-box; }
  body { background: #fffdf9; margin: 0; }

  .root {
    font-family: 'Nunito', sans-serif;
    background: #fffdf9;
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
    background-size: 20px 20px;
    opacity: 0.04;
    pointer-events: none;
    z-index: 0;
  }

  .bangers { font-family: 'Bangers', cursive; letter-spacing: 0.04em; }

  .nav-bar {
    border-bottom: 4px solid #1a1a2e;
    background: #fffdf9;
    box-shadow: 0 4px 0 #1a1a2e;
    position: relative;
    z-index: 10;
  }

  .logo-mark {
    width: 38px; height: 38px;
    background: #ff6b6b;
    border: 3px solid #1a1a2e;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 3px 3px 0 #1a1a2e;
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

  .card {
    background: #fff;
    border: 4px solid #1a1a2e;
    border-radius: 20px;
    box-shadow: 10px 10px 0 #1a1a2e;
    padding: 40px 36px;
    width: 100%;
    max-width: 520px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
  }

  .form-label {
    display: block;
    font-family: 'Bangers', cursive;
    font-size: 17px;
    letter-spacing: 0.05em;
    color: #1a1a2e;
    margin-bottom: 8px;
  }

  .form-input {
    width: 100%;
    padding: 13px 16px;
    font-size: 15px;
    font-family: 'Nunito', sans-serif;
    font-weight: 700;
    color: #1a1a2e;
    background: #fffdf9;
    border: 3px solid #1a1a2e;
    border-radius: 10px;
    outline: none;
    transition: box-shadow 0.15s, border-color 0.15s;
    box-shadow: 4px 4px 0 #1a1a2e;
    resize: none;
  }
  .form-input:focus {
    border-color: #ff6b6b;
    box-shadow: 4px 4px 0 #ff6b6b;
  }
  .form-input::placeholder { color: #bbb; font-weight: 600; }

  .btn-primary {
    width: 100%;
    background: #ff6b6b;
    color: #fff;
    border: 3px solid #1a1a2e;
    cursor: pointer;
    font-family: 'Bangers', cursive;
    letter-spacing: 0.08em;
    border-radius: 10px;
    box-shadow: 6px 6px 0 #1a1a2e;
    transition: transform 0.12s, box-shadow 0.12s;
    font-size: 22px;
    padding: 14px;
  }
  .btn-primary:hover { transform: translate(-2px,-2px); box-shadow: 8px 8px 0 #1a1a2e; }
  .btn-primary:active { transform: translate(2px,2px); box-shadow: 4px 4px 0 #1a1a2e; }

  .btn-secondary {
    background: #ffd93d;
    color: #1a1a2e;
    border: 3px solid #1a1a2e;
    cursor: pointer;
    font-family: 'Bangers', cursive;
    letter-spacing: 0.08em;
    border-radius: 10px;
    box-shadow: 5px 5px 0 #1a1a2e;
    transition: transform 0.12s, box-shadow 0.12s;
    font-size: 18px;
    padding: 12px 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .btn-secondary:hover { transform: translate(-2px,-2px); box-shadow: 7px 7px 0 #1a1a2e; }
  .btn-secondary:active { transform: translate(2px,2px); box-shadow: 3px 3px 0 #1a1a2e; }

  .btn-outline {
    background: #fff;
    color: #1a1a2e;
    border: 3px solid #1a1a2e;
    cursor: pointer;
    font-family: 'Bangers', cursive;
    letter-spacing: 0.08em;
    border-radius: 10px;
    box-shadow: 5px 5px 0 #1a1a2e;
    transition: transform 0.12s, box-shadow 0.12s;
    font-size: 18px;
    padding: 12px 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .btn-outline:hover { transform: translate(-2px,-2px); box-shadow: 7px 7px 0 #1a1a2e; }

  .code-box {
    background: #1a1a2e;
    color: #ffd93d;
    border: 4px solid #1a1a2e;
    border-radius: 14px;
    padding: 20px;
    text-align: center;
    font-family: 'Bangers', cursive;
    font-size: 48px;
    letter-spacing: 0.3em;
    box-shadow: 6px 6px 0 #ff6b6b;
    position: relative;
    overflow: hidden;
    user-select: all;
  }
  .code-box::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px);
    background-size: 12px 12px;
  }

  .link-box {
    background: #fffdf9;
    border: 3px solid #1a1a2e;
    border-radius: 10px;
    padding: 12px 16px;
    font-size: 13px;
    font-weight: 800;
    color: #555;
    word-break: break-all;
    box-shadow: 3px 3px 0 #1a1a2e;
  }

  .success-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #e8fde8;
    border: 3px solid #51cf66;
    border-radius: 8px;
    padding: 4px 14px;
    font-family: 'Bangers', cursive;
    font-size: 15px;
    letter-spacing: 0.04em;
    color: #51cf66;
    box-shadow: 3px 3px 0 #51cf66;
  }

  .error-msg {
    font-family: 'Bangers', cursive;
    font-size: 15px;
    color: #ff6b6b;
    margin-top: 6px;
    letter-spacing: 0.04em;
  }

  .shape { position: absolute; pointer-events: none; }

  .comic-tag {
    display: inline-block;
    background: #ffd93d;
    border: 3px solid #1a1a2e;
    border-radius: 8px;
    padding: 2px 12px;
    font-family: 'Bangers', cursive;
    font-size: 13px;
    letter-spacing: 0.06em;
    box-shadow: 3px 3px 0 #1a1a2e;
    transform: rotate(-2deg);
    margin-bottom: 12px;
  }

  .divider {
    border: none;
    border-top: 3px dashed #e0e0e0;
    margin: 28px 0;
  }

  .step-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px; height: 28px;
    background: #ff6b6b;
    border: 2px solid #1a1a2e;
    border-radius: 50%;
    font-family: 'Bangers', cursive;
    font-size: 15px;
    color: #fff;
    box-shadow: 2px 2px 0 #1a1a2e;
    flex-shrink: 0;
  }

  .ai-suggest-btn {
    background: #e8f4fd;
    border: 2px solid #4ecdc4;
    border-radius: 8px;
    padding: 4px 11px;
    font-family: 'Bangers', cursive;
    font-size: 13px;
    letter-spacing: 0.05em;
    cursor: pointer;
    color: #1a1a2e;
    box-shadow: 2px 2px 0 #4ecdc4;
    transition: transform 0.1s, box-shadow 0.1s;
    white-space: nowrap;
  }
  .ai-suggest-btn:hover { transform: translate(-1px,-1px); box-shadow: 3px 3px 0 #4ecdc4; }
  .ai-suggest-btn:disabled { opacity: 0.6; cursor: wait; }

  .avail-toggle {
    width: 100%;
    background: #fff;
    border: 3px solid #9b59b6;
    border-radius: 10px;
    padding: 10px 16px;
    font-family: 'Bangers', cursive;
    font-size: 16px;
    letter-spacing: 0.05em;
    cursor: pointer;
    color: #9b59b6;
    box-shadow: 4px 4px 0 #9b59b6;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: transform 0.1s, box-shadow 0.1s;
  }
  .avail-toggle:hover { transform: translate(-1px,-1px); box-shadow: 5px 5px 0 #9b59b6; }

  .avail-panel {
    background: #f3e8fd;
    border: 3px solid #9b59b6;
    border-radius: 12px;
    box-shadow: 4px 4px 0 #9b59b6;
    padding: 16px;
    margin-top: 8px;
  }

  .day-chip {
    padding: 5px 8px;
    border-radius: 8px;
    font-family: 'Nunito', sans-serif;
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;
    border: 2px solid #1a1a2e;
    background: #fff;
    color: #1a1a2e;
    box-shadow: 2px 2px 0 #1a1a2e;
    transition: all 0.1s;
  }
  .day-chip.selected { background: #51cf66; }

  .time-chip {
    padding: 5px 10px;
    border-radius: 8px;
    font-family: 'Nunito', sans-serif;
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;
    border: 2px solid #1a1a2e;
    background: #fff;
    color: #1a1a2e;
    box-shadow: 2px 2px 0 #1a1a2e;
    transition: all 0.1s;
  }
  .time-chip.selected { background: #ffd93d; }

  .ai-result-box {
    background: #e8fdf2;
    border: 3px solid #51cf66;
    border-radius: 12px;
    padding: 14px 16px;
    box-shadow: 4px 4px 0 #51cf66;
    font-size: 14px;
    font-weight: 700;
    line-height: 1.5;
    color: #1a1a2e;
    margin-top: 12px;
  }
`;

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function generateUniqueCode(existingHangouts) {
  const usedCodes = new Set((existingHangouts || []).map((hangout) => hangout?.code).filter(Boolean));

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const nextCode = generateCode();
    if (!usedCodes.has(nextCode)) return nextCode;
  }

  return `${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

function buildNextDays() {
  const days = [];
  for (let i = 1; i <= 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      label: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      value: d.toISOString().slice(0, 10),
    });
  }
  return days;
}

const NEXT_7_DAYS = buildNextDays();
const TIME_SLOTS = ["Morning (8am–12pm)", "Afternoon (12pm–5pm)", "Evening (5pm–10pm)"];

function buildAvailabilityPeople(group) {
  const members = group?.members?.length
    ? group.members.map((member) => ({
        id: member.userId || member.username || member.name,
        name: member.name,
        days: [],
        times: [],
      }))
    : [{ id: "you", name: "You", days: [], times: [] }];

  return members;
}

function getBestTimeValue(slot) {
  if (slot.includes("Morning")) return "10:00";
  if (slot.includes("Afternoon")) return "14:00";
  return "19:00";
}

function rankAvailabilitySuggestions(people) {
  if (!people.length) return [];

  return NEXT_7_DAYS.flatMap((day) => (
    TIME_SLOTS.map((slot) => {
      const availableMembers = people.filter((person) => {
        const dayMatch = person.days.length === 0 || person.days.includes(day.value);
        const timeMatch = person.times.length === 0 || person.times.includes(slot);
        return dayMatch && timeMatch;
      });
      const explicitMatches = availableMembers.filter((person) => person.days.includes(day.value) || person.times.includes(slot)).length;

      return {
        date: day.value,
        dateLabel: day.label,
        slot,
        time: getBestTimeValue(slot),
        availableCount: availableMembers.length,
        explicitMatches,
        totalCount: people.length,
        names: availableMembers.map((person) => person.name),
      };
    })
  ))
    .sort((a, b) => (
      b.availableCount - a.availableCount ||
      b.explicitMatches - a.explicitMatches ||
      a.date.localeCompare(b.date) ||
      TIME_SLOTS.indexOf(a.slot) - TIME_SLOTS.indexOf(b.slot)
    ))
    .slice(0, 3)
    .map((suggestion, index) => ({
      ...suggestion,
      summary:
        suggestion.availableCount === suggestion.totalCount
          ? `Everybody can make this one${suggestion.explicitMatches ? " and most of them actually picked it" : ""}.`
          : `${suggestion.availableCount} of ${suggestion.totalCount} members line up here${index === 0 ? ", so this is your strongest overlap" : ""}.`,
    }));
}

function getAvailabilityIssues(people) {
  return (people || []).reduce((issues, person) => {
    const missingDays = !person.days.length;
    const missingTimes = !person.times.length;

    if (!missingDays && !missingTimes) return issues;

    if (missingDays && missingTimes) {
      return [...issues, `${person.name} still needs days and times.`];
    }

    if (missingDays) {
      return [...issues, `${person.name} still needs available days.`];
    }

    return [...issues, `${person.name} still needs preferred times.`];
  }, []);
}

function getStoredApiKey() {
  return localStorage.getItem("outsiders-ai-api-key") || import.meta.env.VITE_OPENAI_API_KEY || "";
}

const IconLogoMark = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
    <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" fill="white"/>
  </svg>
);
const IconCopy = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);
const IconLink = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);
const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconArrow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

export default function OutsidersCreateHangout({ onNavigate, appData, setAppData }) {
  const [form, setForm] = useState({ name: "", date: "", time: "", location: "", vibe: "" });
  const [errors, setErrors] = useState({});
  const [hangout, setHangout] = useState(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showAvailability, setShowAvailability] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(appData?.groups?.[0]?.id || "");
  const [memberAvailability, setMemberAvailability] = useState({});
  const [guestPeople, setGuestPeople] = useState([]);
  const [newPersonName, setNewPersonName] = useState("");
  const [aiTimeLoading, setAiTimeLoading] = useState(false);
  const [aiTimeResult, setAiTimeResult] = useState(null);
  const [aiVibeLoading, setAiVibeLoading] = useState(false);
  const groups = useMemo(() => appData?.groups || [], [appData]);
  const activeGroupId = selectedGroupId && groups.some((group) => String(group.id) === String(selectedGroupId))
    ? selectedGroupId
    : groups[0]?.id || "";
  const selectedGroup = useMemo(
    () => groups.find((group) => String(group.id) === String(activeGroupId)) || null,
    [activeGroupId, groups]
  );
  const availPeople = useMemo(() => {
    const crewPeople = buildAvailabilityPeople(selectedGroup).map((person) => {
      const saved = memberAvailability[String(person.id)];
      return {
        ...person,
        days: saved?.days || [],
        times: saved?.times || [],
      };
    });

    return [...crewPeople, ...guestPeople];
  }, [guestPeople, memberAvailability, selectedGroup]);
  const availabilitySuggestions = useMemo(
    () => rankAvailabilitySuggestions(availPeople),
    [availPeople]
  );
  const availabilityIssues = useMemo(
    () => getAvailabilityIssues(availPeople),
    [availPeople]
  );

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Give your hangout a name!";
    if (!form.date) errs.date = "Pick a date!";
    if (!form.time) errs.time = "What time?";
    if (!form.location.trim()) errs.location = "Where are you going?";
    if (!form.vibe.trim()) errs.vibe = "Set the vibe!";
    return errs;
  };

  const handleCreate = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    const code = generateUniqueCode(appData?.hangouts);
    const createdHangout = {
      ...form,
      code,
      link: buildHangoutInviteLink(code),
      id: Date.now(),
      groupId: selectedGroup?.id || null,
      groupName: selectedGroup?.name || "",
      availability: availPeople,
      members: (selectedGroup?.members || []).map((member) => member.initials || member.name?.slice(0, 3)?.toUpperCase()).filter(Boolean),
      ratings: [],
    };
    setHangout(createdHangout);
    setAppData?.(prev => ({ ...prev, hangouts: [...prev.hangouts, createdHangout] }));
  };

  const copyCode = () => {
    navigator.clipboard.writeText(hangout.code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(hangout.link);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const reset = () => {
    setHangout(null);
    setForm({ name: "", date: "", time: "", location: "", vibe: "" });
    setErrors({});
  };

  function toggleDay(personId, dayValue) {
    if (String(personId).startsWith("guest:")) {
      setGuestPeople((prev) => prev.map((person) => {
        if (String(person.id) !== String(personId)) return person;
        const has = person.days.includes(dayValue);
        return { ...person, days: has ? person.days.filter((day) => day !== dayValue) : [...person.days, dayValue] };
      }));
      return;
    }

    setMemberAvailability((prev) => {
      const current = prev[String(personId)] || { days: [], times: [] };
      const has = current.days.includes(dayValue);
      return {
        ...prev,
        [personId]: {
          ...current,
          days: has ? current.days.filter((day) => day !== dayValue) : [...current.days, dayValue],
        },
      };
    });
  }

  function toggleTime(personId, slot) {
    if (String(personId).startsWith("guest:")) {
      setGuestPeople((prev) => prev.map((person) => {
        if (String(person.id) !== String(personId)) return person;
        const has = person.times.includes(slot);
        return { ...person, times: has ? person.times.filter((time) => time !== slot) : [...person.times, slot] };
      }));
      return;
    }

    setMemberAvailability((prev) => {
      const current = prev[String(personId)] || { days: [], times: [] };
      const has = current.times.includes(slot);
      return {
        ...prev,
        [personId]: {
          ...current,
          times: has ? current.times.filter((time) => time !== slot) : [...current.times, slot],
        },
      };
    });
  }

  function addPerson() {
    const name = newPersonName.trim();
    if (!name) return;
    setGuestPeople((prev) => [...prev, { id: `guest:${name.toLowerCase()}`, name, days: [], times: [] }]);
    setNewPersonName("");
  }

  function removePerson(personId) {
    setGuestPeople((prev) => prev.filter((person) => String(person.id) !== String(personId)));
  }

  async function handleAIFindTime() {
    const apiKey = getStoredApiKey();
    if (!apiKey) {
      setAiTimeResult({ error: "Open the AI panel (bottom right) and add your OpenAI API key first." });
      return;
    }
    setAiTimeLoading(true);
    setAiTimeResult(availabilitySuggestions[0] || null);
    const peopleText = availPeople.map(p => {
      const daysText = p.days.length > 0
        ? `Available on: ${p.days.map(d => NEXT_7_DAYS.find(x => x.value === d)?.label || d).join(", ")}`
        : "No specific days marked — flexible";
      const timesText = p.times.length > 0 ? `Prefers: ${p.times.join(", ")}` : "No time preference";
      return `- ${p.name}: ${daysText}. ${timesText}.`;
    }).join("\n");
    const prompt = `Find the best time for a hangout${form.name ? ` called "${form.name}"` : ""}${form.location ? ` at ${form.location}` : ""}.\n\nAvailability:\n${peopleText}\n\nDates to consider: ${NEXT_7_DAYS.map(d => d.label).join(", ")}\n\nPick the single best date and time that works for everyone. Respond ONLY with JSON: {"date": "YYYY-MM-DD", "time": "HH:MM", "summary": "one sentence why this works"}`;
    try {
      const result = await createOpenAIResponse({
        apiKey,
        model: DEFAULT_OPENAI_MODEL,
        instructions: "You are a scheduling assistant. Find the best overlap in people's availability. Always respond with valid JSON only, no markdown, no extra text.",
        input: [{ role: "user", content: [{ type: "input_text", text: prompt }] }],
      });
      let parsed = null;
      try {
        const match = result.text.match(/\{[\s\S]*\}/);
        if (match) parsed = JSON.parse(match[0]);
      } catch {
        parsed = null;
      }
      setAiTimeResult(parsed?.date && parsed?.time ? parsed : { raw: result.text });
    } catch (err) {
      setAiTimeResult({ error: err.message || "Something went wrong." });
    } finally {
      setAiTimeLoading(false);
    }
  }

  function useAISuggestedTime() {
    if (!aiTimeResult?.date) return;
    setForm(prev => ({ ...prev, date: aiTimeResult.date, time: aiTimeResult.time }));
    setErrors(prev => ({ ...prev, date: "", time: "" }));
    setShowAvailability(false);
  }

  async function handleAISuggestVibe() {
    const apiKey = getStoredApiKey();
    if (!apiKey) {
      setForm(prev => ({ ...prev, vibe: "Open the AI panel (bottom right) and add your OpenAI API key to use this." }));
      return;
    }
    setAiVibeLoading(true);
    const prompt = `Write a short, fun, warm vibe description for a hangout${form.name ? ` called "${form.name}"` : ""}${form.location ? ` at ${form.location}` : ""}${form.date ? ` on ${form.date}` : ""}. Keep it under 2 casual sentences. No quotes around the result.`;
    try {
      const result = await createOpenAIResponse({
        apiKey,
        model: DEFAULT_OPENAI_MODEL,
        instructions: "You write short, warm, casual event descriptions for friend hangouts. Be fun and inviting. Never wrap the result in quotes.",
        input: [{ role: "user", content: [{ type: "input_text", text: prompt }] }],
      });
      setForm(prev => ({ ...prev, vibe: result.text }));
      setErrors(prev => ({ ...prev, vibe: "" }));
    } catch {
      setErrors(prev => ({ ...prev, vibe: "AI couldn't suggest a vibe right now. Try again in a moment." }));
    }
    finally { setAiVibeLoading(false); }
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="root">

        {/* Nav */}
        <nav className="nav-bar">
          <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <button type="button" className="logo-link" onClick={() => onNavigate?.("dashboard")} aria-label="Go to home">
              <div className="logo-mark"><IconLogoMark /></div>
              <span className="bangers" style={{ fontSize: 26, color: "#1a1a2e" }}>Outsiders</span>
            </button>
            <button onClick={() => onNavigate ? onNavigate("dashboard") : reset()} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Bangers', cursive", fontSize: 16, color: "#888", letterSpacing: "0.04em" }}>
              ← Back
            </button>
          </div>
        </nav>

        <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px", position: "relative", overflow: "hidden" }}>

          {/* Shapes */}
          <div className="shape" style={{ top: 30, left: "5%", width: 52, height: 52, background: "#ffd93d", border: "3px solid #1a1a2e", borderRadius: "50%", boxShadow: "5px 5px 0 #1a1a2e" }} />
          <div className="shape" style={{ top: 80, right: "7%", width: 42, height: 42, background: "#4ecdc4", border: "3px solid #1a1a2e", borderRadius: "10px", transform: "rotate(15deg)", boxShadow: "4px 4px 0 #1a1a2e" }} />
          <div className="shape" style={{ bottom: 60, left: "8%", width: 36, height: 36, background: "#a29bfe", border: "3px solid #1a1a2e", borderRadius: "50%", boxShadow: "4px 4px 0 #1a1a2e" }} />
          <div className="shape" style={{ bottom: 40, right: "5%", width: 48, height: 48, background: "#ff6b9d", border: "3px solid #1a1a2e", borderRadius: "10px", transform: "rotate(-12deg)", boxShadow: "4px 4px 0 #1a1a2e" }} />

          {!hangout ? (
            /* ── CREATE FORM ── */
            <div className="card">
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <span className="comic-tag">Let's do this! 🎉</span>
                <h1 className="bangers" style={{ fontSize: 38, color: "#1a1a2e", margin: "0 0 6px" }}>Create A Hangout</h1>
                <p style={{ fontSize: 14, color: "#888", fontWeight: 700, margin: 0 }}>Fill in the details and get your invite code.</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

                {/* Hangout name */}
                <div>
                  <label className="form-label">📍 Hangout Name</label>
                  <input className="form-input" type="text" placeholder="e.g. Friday Night Out" value={form.name} onChange={handleChange("name")} />
                  {errors.name && <p className="error-msg">{errors.name}</p>}
                </div>

                <div>
                  <label className="form-label">👥 Crew</label>
                  <select
                    className="form-input"
                    value={activeGroupId}
                    onChange={(event) => setSelectedGroupId(event.target.value)}
                  >
                    {groups.length === 0 ? (
                      <option value="">No crew yet</option>
                    ) : (
                      groups.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.emoji} {group.name} ({group.members?.length || 0} members)
                        </option>
                      ))
                    )}
                  </select>
                  <p style={{ fontSize: 12, fontWeight: 800, color: "#888", margin: "8px 0 0" }}>
                    Suggestions below use this crew&apos;s availability.
                  </p>
                </div>

                {/* Date & Time row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label className="form-label">📅 Date</label>
                    <input className="form-input" type="date" value={form.date} onChange={handleChange("date")} />
                    {errors.date && <p className="error-msg">{errors.date}</p>}
                  </div>
                  <div>
                    <label className="form-label">⏰ Time</label>
                    <input className="form-input" type="time" value={form.time} onChange={handleChange("time")} />
                    {errors.time && <p className="error-msg">{errors.time}</p>}
                  </div>
                </div>

                {availabilitySuggestions.length > 0 && (
                  <div style={{ background: "#fff4e6", border: "3px solid #ff9a3c", borderRadius: 12, padding: "14px 16px", boxShadow: "4px 4px 0 #ff9a3c" }}>
                    <p className="bangers" style={{ fontSize: 16, margin: "0 0 10px", color: "#1a1a2e" }}>
                      Best Crew Availability
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {availabilitySuggestions.map((suggestion, index) => (
                        <button
                          key={`${suggestion.date}-${suggestion.slot}`}
                          type="button"
                          onClick={() => {
                            setForm((prev) => ({ ...prev, date: suggestion.date, time: suggestion.time }));
                            setErrors((prev) => ({ ...prev, date: "", time: "" }));
                          }}
                          style={{ background: "#fff", border: "2px solid #1a1a2e", borderRadius: 10, padding: "12px 14px", boxShadow: "3px 3px 0 #1a1a2e", cursor: "pointer", textAlign: "left" }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 4 }}>
                            <span className="bangers" style={{ fontSize: 16, color: "#1a1a2e" }}>
                              {index === 0 ? "Top Pick" : `Option ${index + 1}`} · {suggestion.dateLabel}
                            </span>
                            <span style={{ fontSize: 12, fontWeight: 900, color: "#ff9a3c" }}>
                              {suggestion.availableCount}/{suggestion.totalCount} free
                            </span>
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: "#555", marginBottom: 4 }}>
                            {suggestion.slot} · {suggestion.time}
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#666" }}>{suggestion.summary}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Availability Finder */}
                <div>
                  <button type="button" className="avail-toggle" onClick={() => setShowAvailability(prev => !prev)}>
                    <span>🗓 Add Crew Availability</span>
                    <span style={{ fontSize: 12 }}>{showAvailability ? "▲" : "▼"}</span>
                  </button>
                  {showAvailability && (
                    <div className="avail-panel">
                      <p style={{ fontFamily: "'Bangers', cursive", fontSize: 15, letterSpacing: "0.05em", margin: "0 0 14px", color: "#6c3483" }}>
                        Ask every crew member to add their days and time windows here, but you can still keep planning even if some people have not filled it in yet.
                      </p>

                      {availabilityIssues.length > 0 ? (
                        <div style={{ background: "#fff", border: "2px solid #ff6b6b", borderRadius: 10, padding: "10px 12px", boxShadow: "3px 3px 0 #ff6b6b", marginBottom: 12 }}>
                          <p className="bangers" style={{ fontSize: 13, margin: "0 0 6px", color: "#ff6b6b" }}>Still missing</p>
                          {availabilityIssues.map((issue) => (
                            <p key={issue} style={{ fontSize: 12, fontWeight: 800, color: "#555", margin: "0 0 4px" }}>• {issue}</p>
                          ))}
                          <p style={{ fontSize: 12, fontWeight: 800, color: "#7a4d00", margin: "8px 0 0" }}>
                            Planning is still allowed. These missing entries just make the suggested date and time less accurate.
                          </p>
                        </div>
                      ) : (
                        <div style={{ background: "#e8fde8", border: "2px solid #51cf66", borderRadius: 10, padding: "10px 12px", boxShadow: "3px 3px 0 #51cf66", marginBottom: 12 }}>
                          <p className="bangers" style={{ fontSize: 13, margin: "0 0 4px", color: "#51cf66" }}>Availability complete</p>
                          <p style={{ fontSize: 12, fontWeight: 800, color: "#555", margin: 0 }}>Everybody on this list has at least one day and one time selected.</p>
                        </div>
                      )}

                      {availPeople.map((person) => (
                        <div key={person.id} style={{ background: "#fff", border: "2px solid #9b59b6", borderRadius: 10, padding: "12px 14px", marginBottom: 12, boxShadow: "3px 3px 0 #9b59b6" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                            <strong style={{ fontFamily: "'Bangers', cursive", fontSize: 16, letterSpacing: "0.04em" }}>
                              {person.name}
                            </strong>
                            {String(person.id).startsWith("guest:") && (
                              <button type="button" onClick={() => removePerson(person.id)} style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 900, color: "#ff6b6b", fontSize: 18, lineHeight: 1 }}>✕</button>
                            )}
                          </div>
                          <p style={{ fontSize: 12, fontWeight: 800, color: "#9b59b6", margin: "0 0 7px" }}>Available days (tap to select):</p>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                            {NEXT_7_DAYS.map(day => (
                              <button key={day.value} type="button" className={`day-chip ${person.days.includes(day.value) ? "selected" : ""}`} onClick={() => toggleDay(person.id, day.value)}>
                                {day.label}
                              </button>
                            ))}
                          </div>
                          <p style={{ fontSize: 12, fontWeight: 800, color: "#9b59b6", margin: "0 0 7px" }}>Preferred time:</p>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {TIME_SLOTS.map(slot => (
                              <button key={slot} type="button" className={`time-chip ${person.times.includes(slot) ? "selected" : ""}`} onClick={() => toggleTime(person.id, slot)}>
                                {slot}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}

                      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Add another person's name"
                          value={newPersonName}
                          onChange={e => setNewPersonName(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && addPerson()}
                          style={{ flex: 1, padding: "9px 12px", fontSize: 13 }}
                        />
                        <button type="button" onClick={addPerson} style={{ background: "#9b59b6", color: "#fff", border: "3px solid #1a1a2e", borderRadius: 10, padding: "9px 14px", fontFamily: "'Bangers', cursive", fontSize: 15, cursor: "pointer", boxShadow: "3px 3px 0 #1a1a2e", whiteSpace: "nowrap" }}>
                          + Add
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleAIFindTime}
                        disabled={aiTimeLoading}
                        style={{ width: "100%", background: aiTimeLoading ? "#ccc" : "#9b59b6", color: "#fff", border: "3px solid #1a1a2e", borderRadius: 10, padding: "11px", fontFamily: "'Bangers', cursive", fontSize: 18, cursor: aiTimeLoading ? "wait" : "pointer", boxShadow: "4px 4px 0 #1a1a2e", letterSpacing: "0.06em" }}
                      >
                        {aiTimeLoading ? "Finding Best Time..." : "Find Best Time 🗓"}
                      </button>

                      {aiTimeResult && (
                        <div className="ai-result-box">
                          {aiTimeResult.error ? (
                            <span style={{ color: "#ff6b6b" }}>{aiTimeResult.error}</span>
                          ) : aiTimeResult.raw ? (
                            <span>{aiTimeResult.raw}</span>
                          ) : (
                            <div>
                              <div style={{ marginBottom: 6 }}>
                                <span style={{ fontFamily: "'Bangers', cursive", fontSize: 17 }}>Best time: </span>
                                {new Date(aiTimeResult.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} at {aiTimeResult.time}
                              </div>
                              {aiTimeResult.summary && <div style={{ fontSize: 13, color: "#555", marginBottom: 10 }}>{aiTimeResult.summary}</div>}
                              <button
                                type="button"
                                onClick={useAISuggestedTime}
                                style={{ background: "#51cf66", color: "#fff", border: "3px solid #1a1a2e", borderRadius: 8, padding: "8px 14px", fontFamily: "'Bangers', cursive", fontSize: 15, cursor: "pointer", boxShadow: "3px 3px 0 #1a1a2e" }}
                              >
                                Use This Date & Time ✓
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className="form-label">🗺 Location</label>
                  <input className="form-input" type="text" placeholder="e.g. Central Park, New York" value={form.location} onChange={handleChange("location")} />
                  {errors.location && <p className="error-msg">{errors.location}</p>}
                </div>

                {/* Vibe */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <label className="form-label" style={{ margin: 0 }}>✨ Vibe / Description</label>
                    <button type="button" className="ai-suggest-btn" onClick={handleAISuggestVibe} disabled={aiVibeLoading}>
                      {aiVibeLoading ? "Thinking..." : "✨ AI Suggest"}
                    </button>
                  </div>
                  <textarea className="form-input" rows={3} placeholder="e.g. Casual dinner, dress comfy, good vibes only 🙌" value={form.vibe} onChange={handleChange("vibe")} />
                  {errors.vibe && <p className="error-msg">{errors.vibe}</p>}
                </div>

                <button className="btn-primary" onClick={handleCreate} style={{ marginTop: 4 }}>
                  Generate Invite Code 🎟
                </button>
              </div>
            </div>

          ) : (
            /* ── SUCCESS / CODE SCREEN ── */
            <div className="card">
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <span className="comic-tag">You're all set! 🎊</span>
                <h1 className="bangers" style={{ fontSize: 36, color: "#1a1a2e", margin: "0 0 4px" }}>{hangout.name}</h1>
                <p style={{ fontSize: 13, color: "#888", fontWeight: 700, margin: 0 }}>
                  📅 {hangout.date} &nbsp;·&nbsp; ⏰ {hangout.time} &nbsp;·&nbsp; 📍 {hangout.location}
                </p>
              </div>

              {/* Vibe */}
              <div style={{ background: "#fff4e6", border: "3px solid #ff9a3c", borderRadius: 12, padding: "12px 16px", marginBottom: 24, boxShadow: "4px 4px 0 #ff9a3c" }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#555" }}>✨ {hangout.vibe}</p>
              </div>

              <hr className="divider" />

              {/* Code */}
              <div style={{ marginBottom: 20 }}>
                <p className="bangers" style={{ fontSize: 16, marginBottom: 10, letterSpacing: "0.05em", color: "#1a1a2e" }}>🎟 Share This Code With Your Crew:</p>
                <div className="code-box">{hangout.code}</div>
                <button className="btn-secondary" onClick={copyCode} style={{ width: "100%", justifyContent: "center", marginTop: 12 }}>
                  {codeCopied ? <><IconCheck /> Code Copied!</> : <><IconCopy /> Copy Code</>}
                </button>
              </div>

              {/* Link */}
              <div style={{ marginBottom: 24 }}>
                <p className="bangers" style={{ fontSize: 16, marginBottom: 10, letterSpacing: "0.05em", color: "#1a1a2e" }}>🔗 Or Share This Link:</p>
                <div className="link-box">{hangout.link}</div>
                <button className="btn-outline" onClick={copyLink} style={{ width: "100%", justifyContent: "center", marginTop: 12 }}>
                  {linkCopied ? <><IconCheck /> Link Copied!</> : <><IconLink /> Copy Link</>}
                </button>
              </div>

              {/* How it works */}
              <div style={{ background: "#e8f4fd", border: "3px solid #4ecdc4", borderRadius: 12, padding: "16px", boxShadow: "4px 4px 0 #4ecdc4", marginBottom: 24 }}>
                <p className="bangers" style={{ fontSize: 16, margin: "0 0 12px", color: "#1a1a2e", letterSpacing: "0.04em" }}>How Your Friends Join:</p>
                {[
                  "They sign up or log in to Outsiders",
                  "They click 'Join a Hangout'",
                  "They enter the code or use the link",
                  "They're in! 🎉",
                ].map((step, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: i < 3 ? 10 : 0 }}>
                    <span className="step-pill">{i + 1}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#444" }}>{step}</span>
                  </div>
                ))}
              </div>

              <button className="btn-primary" onClick={reset} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                Create Another Hangout <IconArrow />
              </button>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
