export const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const DEFAULT_AVAILABILITY = {
  slots: WEEK_DAYS.reduce((acc, day) => ({ ...acc, [day]: [] }), {}),
};

export function toMinutes(time) {
  if (!time || !time.includes(":")) return null;
  const [hours, minutes] = time.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return (hours * 60) + minutes;
}

export function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

export function formatTimeLabel(time) {
  if (!time) return "";
  return new Date(`2000-01-01T${time}:00`).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatSlot(slot) {
  if (!slot?.start || !slot?.end) return "";
  if (slot.start === "00:00" && slot.end === "23:59") return "All day";
  return `${formatTimeLabel(slot.start)} - ${formatTimeLabel(slot.end)}`;
}

export function normalizeAvailability(availability) {
  const normalized = { ...DEFAULT_AVAILABILITY, slots: { ...DEFAULT_AVAILABILITY.slots } };

  if (availability?.slots && typeof availability.slots === "object") {
    WEEK_DAYS.forEach((day) => {
      normalized.slots[day] = Array.isArray(availability.slots[day])
        ? availability.slots[day].filter((slot) => slot?.start && slot?.end)
        : [];
    });
    return normalized;
  }

  const legacyDays = availability?.days || [];
  const start = availability?.startTime || "";
  const end = availability?.endTime || "";
  if (Array.isArray(legacyDays) && start && end) {
    legacyDays.forEach((day) => {
      const key = WEEK_DAYS.includes(day) ? day : null;
      if (key) normalized.slots[key] = [{ start, end }];
    });
  }

  return normalized;
}

export function hasAvailability(availability) {
  const normalized = normalizeAvailability(availability);
  return WEEK_DAYS.some((day) => normalized.slots[day]?.length > 0);
}

export function availabilityToText(availability) {
  const normalized = normalizeAvailability(availability);
  const lines = WEEK_DAYS.flatMap((day) => {
    const slots = normalized.slots[day] || [];
    if (!slots.length) return [];
    return `${day}: ${slots.map(formatSlot).join(", ")}`;
  });
  return lines.length ? lines.join(" • ") : "No availability saved";
}

function slotContains(slot, start, end) {
  const slotStart = toMinutes(slot.start);
  const slotEnd = toMinutes(slot.end);
  return slotStart !== null && slotEnd !== null && slotStart <= start && slotEnd >= end;
}

export function recommendHangoutTimes(participants, options = {}) {
  const durationMinutes = options.durationMinutes || 120;
  const stepMinutes = options.stepMinutes || 30;
  const earliest = options.earliestMinutes || (9 * 60);
  const latest = options.latestMinutes || (23 * 60);
  const people = (participants || []).map((person) => ({
    ...person,
    availability: normalizeAvailability(person.availability),
  }));

  if (!people.length) return [];

  const candidates = [];
  WEEK_DAYS.forEach((day, dayIndex) => {
    for (let start = earliest; start + durationMinutes <= latest; start += stepMinutes) {
      const end = start + durationMinutes;
      const available = [];
      const unavailable = [];
      let overlapLength = 0;

      people.forEach((person) => {
        const slots = person.availability.slots[day] || [];
        const matchingSlot = slots.find((slot) => slotContains(slot, start, end));
        if (matchingSlot) {
          available.push(person.name);
          overlapLength += Math.min(toMinutes(matchingSlot.end), latest) - Math.max(toMinutes(matchingSlot.start), earliest);
        } else {
          unavailable.push(person.name);
        }
      });

      if (available.length > 0) {
        candidates.push({
          day,
          dayIndex,
          start: minutesToTime(start),
          end: minutesToTime(end),
          available,
          unavailable,
          availableCount: available.length,
          totalCount: people.length,
          overlapLength,
          score: (available.length * 100000) + overlapLength - (dayIndex * 100) - start,
        });
      }
    }
  });

  return candidates
    .sort((a, b) => b.score - a.score)
    .filter((candidate, index, all) => (
      all.findIndex((item) => item.day === candidate.day && item.start === candidate.start) === index
    ))
    .slice(0, 3);
}
