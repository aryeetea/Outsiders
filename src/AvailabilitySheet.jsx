import { useEffect, useMemo, useState } from "react";
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
    background: linear-gradient(135deg, #4ecdc4, #51cf66);
    box-shadow: inset 0 0 0 2px rgba(26, 26, 46, 0.12), 0 4px 0 rgba(26, 26, 46, 0.12);
  }

  .availability-slot.dragging::after {
    background: linear-gradient(135deg, #ffd93d, #ff9a3c);
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
  }
`;

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
}) {
  const [dragMode, setDragMode] = useState(null);
  const activeBlocks = useMemo(() => getAvailabilityBlockSet(value), [value]);
  const ready = hasAvailability(value);
  const summary = useMemo(() => summaryText(value), [value]);

  useEffect(() => {
    if (!dragMode) return undefined;
    const stopDrag = () => setDragMode(null);
    window.addEventListener("mouseup", stopDrag);
    return () => window.removeEventListener("mouseup", stopDrag);
  }, [dragMode]);

  const setAvailabilityFromBlocks = (blocks) => {
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
    const key = `${day}-${time}`;
    const mode = activeBlocks.has(key) ? "remove" : "add";
    setDragMode(mode);
    toggleBlock(day, time, mode);
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
              <button type="button" className="availability-btn" onClick={() => onChange?.({ slots: WEEK_DAYS.reduce((acc, day) => ({ ...acc, [day]: [] }), {}) })}>
                Clear sheet
              </button>
            ) : null}
            {footerAction || null}
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
                onMouseDown={startDrag}
                onMouseEnter={(day) => {
                  if (!dragMode) return;
                  toggleBlock(day, time, dragMode);
                }}
              />
            ))}
          </div>
        </div>

        {showSummary ? (
          <div className="availability-footer">
            <div className="availability-pill">Green blocks = available</div>
            <div className="availability-pill">Tap once for a single slot</div>
            <div className="availability-pill">Click and drag for a whole stretch</div>
            <div className="availability-pill">{summary}</div>
          </div>
        ) : null}
      </section>
    </>
  );
}

function AvailabilityRow({ time, activeBlocks, dragMode, onMouseDown, onMouseEnter }) {
  return (
    <>
      <div className="availability-time">{formatTimeLabel(time)}</div>
      {WEEK_DAYS.map((day) => {
        const key = `${day}-${time}`;
        return (
          <div
            key={key}
            className={`availability-slot ${activeBlocks.has(key) ? "active" : ""} ${dragMode ? "dragging" : ""}`}
            onMouseDown={() => onMouseDown(day, time)}
            onMouseEnter={() => onMouseEnter(day)}
            onClick={() => {
              if (!dragMode) onMouseDown(day, time);
            }}
          />
        );
      })}
    </>
  );
}
