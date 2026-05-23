import { useEffect, useMemo, useState } from "react";
import { TIME_BLOCKS, WEEK_DAYS, availabilityToText, blocksToAvailability, formatTimeLabel, getAvailabilityBlockSet, hasAvailability } from "./scheduling";

const STYLES = `
  .availability-sheet {
    border-radius: 26px;
    border: 1px solid rgba(29, 34, 56, 0.12);
    overflow: hidden;
    background:
      radial-gradient(circle at top right, rgba(123, 214, 255, 0.2), transparent 25%),
      radial-gradient(circle at top left, rgba(255, 122, 107, 0.16), transparent 30%),
      rgba(255, 255, 255, 0.9);
    box-shadow: 0 22px 60px rgba(29, 34, 56, 0.08);
  }

  .availability-sheet.compact {
    border-radius: 22px;
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
    padding: 8px 12px;
    border-radius: 999px;
    background: rgba(255, 214, 153, 0.45);
    color: #7b4e12;
    font: 700 12px 'Space Grotesk', sans-serif;
  }

  .availability-frame {
    border-top: 1px solid rgba(29, 34, 56, 0.08);
    border-bottom: 1px solid rgba(29, 34, 56, 0.08);
    overflow: auto;
    background: rgba(248, 250, 252, 0.9);
  }

  .availability-grid {
    display: grid;
    grid-template-columns: 86px repeat(7, minmax(110px, 1fr));
    min-width: 900px;
  }

  .availability-head,
  .availability-time,
  .availability-slot {
    border-right: 1px solid rgba(29, 34, 56, 0.08);
    border-bottom: 1px solid rgba(29, 34, 56, 0.08);
  }

  .availability-head {
    position: sticky;
    top: 0;
    z-index: 2;
    background: rgba(255, 255, 255, 0.96);
    padding: 14px 10px;
    text-align: center;
  }

  .availability-head strong {
    display: block;
    font: 700 14px 'Sora', sans-serif;
    color: #1d2238;
  }

  .availability-head span {
    font-size: 12px;
    color: #7a8294;
  }

  .availability-time {
    padding: 12px 10px;
    background: rgba(255, 255, 255, 0.92);
    text-align: right;
    font-size: 12px;
    font-weight: 700;
    color: #7a8294;
  }

  .availability-slot {
    min-height: 40px;
    position: relative;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.56);
  }

  .availability-slot::after {
    content: "";
    position: absolute;
    inset: 6px;
    border-radius: 12px;
    transition: background 140ms ease, transform 140ms ease, box-shadow 140ms ease;
  }

  .availability-slot:hover::after {
    background: rgba(123, 214, 255, 0.18);
    transform: scale(0.97);
  }

  .availability-slot.active::after {
    background: linear-gradient(135deg, #7bd6ff, #56e0a0);
    box-shadow: inset 0 0 0 1px rgba(12, 80, 56, 0.12), 0 10px 18px rgba(86, 224, 160, 0.18);
  }

  .availability-slot.dragging::after {
    background: linear-gradient(135deg, #ffd58f, #ff8f7a);
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
    border-radius: 999px;
    font: 700 13px 'Space Grotesk', sans-serif;
  }

  .availability-pill {
    border: 1px solid rgba(29, 34, 56, 0.12);
    background: rgba(255, 255, 255, 0.92);
    color: #3d475d;
    padding: 10px 12px;
  }

  .availability-btn {
    border: 1px solid rgba(29, 34, 56, 0.12);
    background: rgba(255, 255, 255, 0.9);
    color: #1d2238;
    padding: 10px 12px;
    cursor: pointer;
    transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease;
  }

  .availability-btn:hover {
    transform: translateY(-2px);
  }

  .availability-btn.primary {
    border: none;
    background: linear-gradient(135deg, #ff7a6b, #ff9671);
    color: white;
    box-shadow: 0 16px 30px rgba(255, 122, 107, 0.24);
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
            <h2 style={{ margin: "12px 0 8px", font: compact ? "800 26px 'Sora', sans-serif" : "800 32px 'Sora', sans-serif", color: "#1d2238" }}>{title}</h2>
            <p style={{ margin: 0, color: "#556077", lineHeight: 1.6, maxWidth: 720 }}>{subtitle}</p>
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
