import { useEffect, useMemo, useRef, useState } from "react";
import { TIME_BLOCKS, WEEK_DAYS, availabilityToText, blocksToAvailability, formatTimeLabel, getAvailabilityBlockSet, hasAvailability } from "./scheduling";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Nunito:wght@400;700;800;900&display=swap');

  .availability-sheet {
    border-radius: 22px;
    border: 4px solid #1a1a2e;
    overflow: hidden;
    background: #fffdf9;
    box-shadow: 8px 8px 0 #1a1a2e;
  }

  .availability-sheet.compact {
    border-radius: 18px;
  }

  .availability-sheet-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    padding: 22px 22px 18px;
  }

  .availability-sheet.compact .availability-sheet-header {
    padding: 18px 18px 14px;
  }

  .availability-kicker {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 3px 10px;
    border-radius: 7px;
    border: 2px solid #1a1a2e;
    background: #ffd93d;
    color: #1a1a2e;
    font: 400 12px 'Bangers', cursive;
    letter-spacing: 0.06em;
    box-shadow: 2px 2px 0 #1a1a2e;
    transform: rotate(-2deg);
  }

  .availability-frame {
    border-top: 3px solid #1a1a2e;
    border-bottom: 3px solid #1a1a2e;
    overflow: auto;
    background: #f5f3ee;
  }

  .availability-help {
    padding: 0 22px 18px;
    display: grid;
    gap: 12px;
  }

  .availability-sheet.compact .availability-help {
    padding: 0 18px 14px;
  }

  .availability-tipbox {
    border: 3px solid #1a1a2e;
    border-radius: 16px;
    background: #fff7da;
    box-shadow: 4px 4px 0 #1a1a2e;
    padding: 14px;
  }

  .availability-shortcuts {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(145px, 1fr));
    gap: 12px;
  }

  .availability-day-card {
    border: 3px solid #1a1a2e;
    border-radius: 16px;
    background: #fff;
    box-shadow: 4px 4px 0 #1a1a2e;
    padding: 12px;
    display: grid;
    gap: 10px;
    min-width: 0;
  }

  .availability-day-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .availability-mini-btn {
    border: 2px solid #1a1a2e;
    background: #fff;
    color: #1a1a2e;
    border-radius: 999px;
    padding: 6px 9px;
    cursor: pointer;
    font: 800 11px 'Nunito', sans-serif;
    box-shadow: 2px 2px 0 #1a1a2e;
    flex: 1 1 calc(50% - 8px);
    min-width: 0;
    justify-content: center;
    text-align: center;
  }

  .availability-mini-btn:hover {
    transform: translateY(-1px);
  }

  .availability-grid {
    display: grid;
    grid-template-columns: 86px repeat(7, minmax(110px, 1fr));
    min-width: 900px;
  }

  .availability-head,
  .availability-time,
  .availability-slot {
    border-right: 2px solid rgba(26, 26, 46, 0.12);
    border-bottom: 2px solid rgba(26, 26, 46, 0.12);
  }

  .availability-head {
    position: sticky;
    top: 0;
    z-index: 2;
    background: #fffdf9;
    padding: 14px 10px;
    text-align: center;
  }

  .availability-head strong {
    display: block;
    font: 400 18px 'Bangers', cursive;
    color: #1a1a2e;
    letter-spacing: 0.05em;
  }

  .availability-head span {
    font-size: 12px;
    color: #777;
    font-family: 'Nunito', sans-serif;
    font-weight: 800;
  }

  .availability-time {
    padding: 12px 10px;
    background: #fff;
    text-align: right;
    font-size: 12px;
    font-weight: 900;
    color: #666;
    font-family: 'Nunito', sans-serif;
  }

  .availability-slot {
    min-height: 40px;
    position: relative;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.66);
    touch-action: none;
  }

  .availability-slot::after {
    content: "";
    position: absolute;
    inset: 6px;
    border-radius: 12px;
    transition: background 140ms ease, transform 140ms ease, box-shadow 140ms ease;
  }

  .availability-slot:hover::after {
    background: rgba(78, 205, 196, 0.16);
    transform: scale(0.97);
  }

  .availability-slot.active::after {
    background: #51cf66;
    box-shadow: inset 0 0 0 2px rgba(26, 26, 46, 0.12), 0 4px 0 rgba(26, 26, 46, 0.12);
  }

  .availability-slot.dragging::after {
    background: #ffd93d;
  }

  .availability-footer {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    padding: 18px 22px 22px;
  }

  .availability-sheet.compact .availability-footer {
    padding: 14px 18px 18px;
  }

  .availability-pill,
  .availability-btn {
    font: 800 13px 'Nunito', sans-serif;
  }

  .availability-pill {
    border: 3px solid #1a1a2e;
    background: #fff;
    color: #1a1a2e;
    border-radius: 999px;
    padding: 10px 12px;
    box-shadow: 3px 3px 0 #1a1a2e;
  }

  .availability-btn {
    border: 3px solid #1a1a2e;
    background: #fff;
    color: #1a1a2e;
    border-radius: 10px;
    padding: 10px 12px;
    cursor: pointer;
    transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease;
    font-family: 'Bangers', cursive;
    letter-spacing: 0.06em;
    box-shadow: 4px 4px 0 #1a1a2e;
  }

  .availability-btn:hover {
    transform: translateY(-2px);
  }

  .availability-btn.primary {
    background: #ff6b6b;
    color: white;
    box-shadow: 4px 4px 0 #1a1a2e;
  }

  @media (max-width: 720px) {
    .availability-sheet-header {
      flex-direction: column;
    }

    .availability-shortcuts {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 520px) {
    .availability-shortcuts {
      grid-template-columns: 1fr;
    }

    .availability-mini-btn {
      flex-basis: 100%;
    }
  }
`;

const RANGE_PRESETS = [
  { label: "Morning", start: "08:00", end: "12:00" },
  { label: "Afternoon", start: "12:00", end: "17:00" },
  { label: "Evening", start: "17:00", end: "22:00" },
];

function summaryText(availability) {
  const text = availabilityToText(availability);
  return text === "No availability saved" ? "No availability saved yet." : text;
}

export default function AvailabilitySheet({
  value,
  onChange,
  title = "Weekly availability",
  subtitle = "Mark every half-hour block when you are realistically free.",
  required = false,
  compact = false,
  showClear = true,
  showSummary = true,
  footerAction,
  readOnly = false,
}) {
  const [dragMode, setDragMode] = useState(null);
  const dragTouchedKeys = useRef(new Set());
  const activeBlocks = useMemo(() => getAvailabilityBlockSet(value), [value]);
  const ready = hasAvailability(value);
  const summary = useMemo(() => summaryText(value), [value]);

  useEffect(() => {
    if (!dragMode) return undefined;
    const stopDrag = () => {
      setDragMode(null);
      dragTouchedKeys.current = new Set();
    };
    window.addEventListener("mouseup", stopDrag);
    window.addEventListener("touchend", stopDrag);
    return () => {
      window.removeEventListener("mouseup", stopDrag);
      window.removeEventListener("touchend", stopDrag);
    };
  }, [dragMode]);

  const setAvailabilityFromBlocks = (blocks) => {
    if (readOnly) return;
    onChange?.(blocksToAvailability(blocks));
  };

  const toggleBlock = (day, time, forcedMode = null) => {
    const key = `${day}-${time}`;
    const next = new Set(activeBlocks);
    const shouldAdd = forcedMode ? forcedMode === "add" : !next.has(key);
    if (shouldAdd) next.add(key);
    else next.delete(key);
    setAvailabilityFromBlocks(next);
  };

  const startDrag = (day, time) => {
    if (readOnly) return;
    const key = `${day}-${time}`;
    const mode = activeBlocks.has(key) ? "remove" : "add";
    setDragMode(mode);
    dragTouchedKeys.current = new Set([key]);
    toggleBlock(day, time, mode);
  };

  const continueDrag = (day, time) => {
    if (readOnly) return;
    if (!dragMode) return;
    const key = `${day}-${time}`;
    if (dragTouchedKeys.current.has(key)) return;
    dragTouchedKeys.current.add(key);
    toggleBlock(day, time, dragMode);
  };

  const applyPresetToDay = (day, start, end, mode = "add") => {
    if (readOnly) return;
    const next = new Set(activeBlocks);
    TIME_BLOCKS.forEach((time) => {
      if (time >= start && time < end) {
        const key = `${day}-${time}`;
        if (mode === "add") next.add(key);
        else next.delete(key);
      }
    });
    setAvailabilityFromBlocks(next);
  };

  const toggleAllDay = (day) => {
    if (readOnly) return;
    const hasAny = TIME_BLOCKS.some((time) => activeBlocks.has(`${day}-${time}`));
    applyPresetToDay(day, TIME_BLOCKS[0], TIME_BLOCKS[TIME_BLOCKS.length - 1] ? "23:00" : "23:00", hasAny ? "remove" : "add");
  };

  return (
    <>
      <style>{STYLES}</style>
      <section className={`availability-sheet ${compact ? "compact" : ""}`}>
        <div className="availability-sheet-header">
          <div>
            <span className="availability-kicker">{required ? "Required availability" : "Availability"}</span>
            <h2 style={{ margin: "12px 0 8px", font: compact ? "400 30px 'Bangers', cursive" : "400 36px 'Bangers', cursive", color: "#1a1a2e", letterSpacing: "0.04em" }}>{title}</h2>
            <p style={{ margin: 0, color: "#555", lineHeight: 1.6, maxWidth: 720, fontFamily: "'Nunito', sans-serif", fontWeight: 800 }}>{subtitle}</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {showClear ? (
              <button type="button" className="availability-btn" disabled={readOnly} onClick={() => onChange?.({ slots: WEEK_DAYS.reduce((acc, day) => ({ ...acc, [day]: [] }), {}) })}>
                Clear sheet
              </button>
            ) : null}
            {footerAction || null}
          </div>
        </div>

        <div className="availability-help">
          <div className="availability-tipbox">
            <div className="bangers" style={{ fontSize: 18, marginBottom: 6, color: "#1a1a2e" }}>Easier way to fill this out</div>
            <div style={{ color: "#555", lineHeight: 1.5, fontWeight: 800, fontSize: 14 }}>
              Use the day shortcuts first, then tap any half-hour block to fine-tune. You can still drag across blocks, but you do not have to.
            </div>
          </div>

          <div className="availability-shortcuts">
            {WEEK_DAYS.map((day) => {
              const dayCount = TIME_BLOCKS.filter((time) => activeBlocks.has(`${day}-${time}`)).length;
              return (
                <div key={day} className="availability-day-card">
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                    <strong className="bangers" style={{ fontSize: 18, color: "#1a1a2e" }}>{day}</strong>
                    <span style={{ fontSize: 11, fontWeight: 900, color: "#666" }}>{dayCount ? `${dayCount} slots` : "Empty"}</span>
                  </div>
                  <div className="availability-day-actions">
                    {RANGE_PRESETS.map((preset) => (
                      <button key={`${day}-${preset.label}`} type="button" className="availability-mini-btn" onClick={() => applyPresetToDay(day, preset.start, preset.end, "add")}>
                        {preset.label}
                      </button>
                    ))}
                    <button type="button" className="availability-mini-btn" disabled={readOnly} onClick={() => toggleAllDay(day)}>
                      All day
                    </button>
                    <button type="button" className="availability-mini-btn" disabled={readOnly} onClick={() => applyPresetToDay(day, "08:00", "23:00", "remove")}>
                      Clear
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="availability-frame">
          <div className="availability-grid">
            <div className="availability-head" />
            {WEEK_DAYS.map((day) => (
              <div key={day} className="availability-head">
                <strong>{day}</strong>
                <span>{ready && (value?.slots?.[day]?.length || 0) > 0 ? "Free time saved" : "Tap to mark"}</span>
              </div>
            ))}

            {TIME_BLOCKS.map((time) => (
              <AvailabilityRow
                key={time}
                time={time}
                activeBlocks={activeBlocks}
                dragMode={dragMode}
                readOnly={readOnly}
                onMouseDown={startDrag}
                onMouseEnter={(day) => continueDrag(day, time)}
              />
            ))}
          </div>
        </div>

        {showSummary ? (
          <div className="availability-footer">
            <div className="availability-pill">Green blocks = available</div>
            <div className="availability-pill">Use day shortcuts for morning, afternoon, or evening</div>
            <div className="availability-pill">Tap any block to fine-tune</div>
            <div className="availability-pill">{summary}</div>
          </div>
        ) : null}
      </section>
    </>
  );
}

function AvailabilityRow({ time, activeBlocks, dragMode, readOnly, onMouseDown, onMouseEnter }) {
  return (
    <>
      <div className="availability-time">{formatTimeLabel(time)}</div>
      {WEEK_DAYS.map((day) => {
        const key = `${day}-${time}`;
        return (
          <div
            key={key}
            className={`availability-slot ${activeBlocks.has(key) ? "active" : ""} ${dragMode ? "dragging" : ""}`}
            style={{ cursor: readOnly ? "default" : "pointer" }}
            onMouseDown={() => !readOnly && onMouseDown(day, time)}
            onMouseEnter={() => !readOnly && onMouseEnter(day)}
            onTouchStart={() => !readOnly && onMouseDown(day, time)}
          />
        );
      })}
    </>
  );
}
