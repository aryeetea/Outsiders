import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
    -webkit-overflow-scrolling: touch;
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
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 14px;
  }

  .availability-mobile-nav {
    display: none;
    grid-template-columns: auto 1fr auto;
    gap: 10px;
    align-items: center;
    padding: 0 22px 18px;
  }

  .availability-mobile-days {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 4px;
    scrollbar-width: thin;
  }

  .availability-day-card {
    border: 3px solid #1a1a2e;
    border-radius: 16px;
    background: #fff;
    box-shadow: 4px 4px 0 #1a1a2e;
    padding: 16px;
    display: grid;
    gap: 14px;
    min-width: 0;
    align-content: start;
  }

  .availability-day-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .availability-mini-btn {
    border: 2px solid #1a1a2e;
    background: #fff;
    color: #1a1a2e;
    border-radius: 999px;
    padding: 10px 12px;
    cursor: pointer;
    font: 800 12px 'Nunito', sans-serif;
    line-height: 1.2;
    box-shadow: 2px 2px 0 #1a1a2e;
    min-width: 0;
    text-align: center;
    min-height: 54px;
    display: grid;
    place-items: center;
    word-break: keep-all;
    position: relative;
  }

  .availability-mini-btn:hover {
    transform: translateY(-1px);
  }

  .availability-mini-btn.active {
    background: #eafaf0;
    border-color: #1f8f4d;
    color: #14532d;
    box-shadow: 2px 2px 0 #1f8f4d;
  }

  .availability-mini-check {
    position: absolute;
    top: 8px;
    right: 10px;
    font-size: 14px;
    font-weight: 900;
    line-height: 1;
  }

  .availability-grid {
    display: grid;
    grid-template-columns: 86px repeat(7, minmax(110px, 1fr));
    min-width: 900px;
  }

  .availability-grid.single-day {
    grid-template-columns: 86px minmax(180px, 1fr);
    min-width: 0;
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

  .availability-corner {
    left: 0;
    z-index: 4;
  }

  .availability-time {
    position: sticky;
    left: 0;
    z-index: 1;
    padding: 12px 10px;
    background: #fff;
    text-align: right;
    font-size: 12px;
    font-weight: 900;
    color: #666;
    font-family: 'Nunito', sans-serif;
  }

  .availability-slot {
    min-height: 44px;
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

  .availability-slot-indicator {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    z-index: 1;
    pointer-events: none;
    color: #fff;
    font: 900 18px 'Nunito', sans-serif;
    opacity: 0;
    transform: scale(0.7);
    transition: opacity 140ms ease, transform 140ms ease;
  }

  .availability-slot:hover::after {
    background: rgba(78, 205, 196, 0.16);
    transform: scale(0.97);
  }

  .availability-slot.active::after {
    background: linear-gradient(180deg, #51cf66 0%, #2fb355 100%);
    box-shadow: inset 0 0 0 2px rgba(26, 26, 46, 0.12), 0 4px 0 rgba(26, 26, 46, 0.12);
  }

  .availability-slot.active .availability-slot-indicator {
    opacity: 1;
    transform: scale(1);
  }

  .availability-slot.dragging::after {
    background: #ffd93d;
  }

  .availability-slot.recent::after {
    animation: availability-pop 180ms ease;
  }

  .availability-slot.recent .availability-slot-indicator {
    animation: availability-check-pop 220ms ease;
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
      grid-template-columns: 1fr;
    }

    .availability-mobile-nav {
      display: grid;
    }

    .availability-frame {
      overflow-x: auto;
    }

    .availability-help {
      padding: 0 14px 14px;
    }

    .availability-mobile-nav {
      padding: 0 14px 14px;
    }

    .availability-grid {
      grid-template-columns: 74px repeat(7, minmax(88px, 1fr));
      min-width: 760px;
    }

    .availability-grid.single-day {
      grid-template-columns: 74px minmax(220px, 1fr);
      min-width: 0;
    }

    .availability-head {
      padding: 12px 8px;
    }

    .availability-time {
      padding: 12px 8px;
      font-size: 11px;
    }

    .availability-slot {
      min-height: 48px;
    }
  }

  @media (max-width: 520px) {
    .availability-day-actions {
      grid-template-columns: 1fr;
    }

    .availability-mini-btn {
      min-height: 48px;
    }
  }

  @keyframes availability-pop {
    0% { transform: scale(0.96); }
    55% { transform: scale(1.03); }
    100% { transform: scale(1); }
  }

  @keyframes availability-check-pop {
    0% { transform: scale(0.65); }
    65% { transform: scale(1.14); }
    100% { transform: scale(1); }
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

function getPreferredMobileDay() {
  const todayIndex = new Date().getDay();
  const mappedIndex = todayIndex === 0 ? 6 : todayIndex - 1;
  return WEEK_DAYS[mappedIndex] || WEEK_DAYS[0];
}

function isRangeFullySelected(activeBlocks, day, start, end) {
  const keysInRange = TIME_BLOCKS.filter((time) => time >= start && time < end);
  return keysInRange.length > 0 && keysInRange.every((time) => activeBlocks.has(`${day}-${time}`));
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
  const [selectedDay, setSelectedDay] = useState(getPreferredMobileDay);
  const [isCondensedView, setIsCondensedView] = useState(false);
  const [recentlyToggledKey, setRecentlyToggledKey] = useState("");
  const dragTouchedKeys = useRef(new Set());
  const activeBlocks = useMemo(() => getAvailabilityBlockSet(value), [value]);
  const ready = hasAvailability(value);
  const summary = useMemo(() => summaryText(value), [value]);
  const visibleDays = isCondensedView ? [selectedDay] : WEEK_DAYS;

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const mediaQuery = window.matchMedia("(max-width: 720px)");
    const syncCondensedView = (event) => {
      setIsCondensedView(event.matches);
    };

    syncCondensedView(mediaQuery);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", syncCondensedView);
      return () => mediaQuery.removeEventListener("change", syncCondensedView);
    }

    mediaQuery.addListener(syncCondensedView);
    return () => mediaQuery.removeListener(syncCondensedView);
  }, []);

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

  const setAvailabilityFromBlocks = useCallback((blocks) => {
    if (readOnly) return;
    onChange?.(blocksToAvailability(blocks));
  }, [onChange, readOnly]);

  const toggleBlock = useCallback((day, time, forcedMode = null) => {
    const key = `${day}-${time}`;
    const next = new Set(activeBlocks);
    const shouldAdd = forcedMode ? forcedMode === "add" : !next.has(key);
    if (shouldAdd) next.add(key);
    else next.delete(key);
    setRecentlyToggledKey(key);
    setAvailabilityFromBlocks(next);
  }, [activeBlocks, setAvailabilityFromBlocks]);

  useEffect(() => {
    if (!recentlyToggledKey) return undefined;
    const timeoutId = window.setTimeout(() => {
      setRecentlyToggledKey("");
    }, 220);
    return () => window.clearTimeout(timeoutId);
  }, [recentlyToggledKey]);

  const startDrag = (day, time) => {
    if (readOnly) return;
    const key = `${day}-${time}`;
    const mode = activeBlocks.has(key) ? "remove" : "add";
    setDragMode(mode);
    dragTouchedKeys.current = new Set([key]);
    toggleBlock(day, time, mode);
  };

  const continueDrag = useCallback((day, time) => {
    if (readOnly) return;
    if (!dragMode) return;
    const key = `${day}-${time}`;
    if (dragTouchedKeys.current.has(key)) return;
    dragTouchedKeys.current.add(key);
    toggleBlock(day, time, dragMode);
  }, [dragMode, readOnly, toggleBlock]);

  useEffect(() => {
    if (!dragMode) return undefined;
    const continueTouchDrag = (event) => {
      const touch = event.touches?.[0];
      if (!touch) return;
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      const slot = target?.closest?.("[data-availability-slot='true']");
      const day = slot?.getAttribute("data-day");
      const time = slot?.getAttribute("data-time");
      if (!day || !time) return;
      event.preventDefault();
      continueDrag(day, time);
    };

    window.addEventListener("touchmove", continueTouchDrag, { passive: false });
    return () => {
      window.removeEventListener("touchmove", continueTouchDrag);
    };
  }, [dragMode, continueDrag]);

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

  const changeSelectedDay = (direction) => {
    setSelectedDay((currentDay) => {
      const currentIndex = WEEK_DAYS.indexOf(currentDay);
      const safeIndex = currentIndex >= 0 ? currentIndex : 0;
      const nextIndex = (safeIndex + direction + WEEK_DAYS.length) % WEEK_DAYS.length;
      return WEEK_DAYS[nextIndex];
    });
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
              const allDayActive = TIME_BLOCKS.every((time) => activeBlocks.has(`${day}-${time}`));
              return (
                <div key={day} className="availability-day-card">
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                    <strong className="bangers" style={{ fontSize: 18, color: "#1a1a2e" }}>{day}</strong>
                    <span style={{ fontSize: 11, fontWeight: 900, color: "#666" }}>{dayCount ? `${dayCount} slots` : "Empty"}</span>
                  </div>
                  <div className="availability-day-actions">
                    {RANGE_PRESETS.map((preset) => (
                      <button
                        key={`${day}-${preset.label}`}
                        type="button"
                        className={`availability-mini-btn ${isRangeFullySelected(activeBlocks, day, preset.start, preset.end) ? "active" : ""}`}
                        onClick={() => {
                          setSelectedDay(day);
                          applyPresetToDay(day, preset.start, preset.end, "add");
                        }}
                      >
                        {preset.label}
                        {isRangeFullySelected(activeBlocks, day, preset.start, preset.end) ? (
                          <span className="availability-mini-check" aria-hidden="true">✓</span>
                        ) : null}
                      </button>
                    ))}
                    <button
                      type="button"
                      className={`availability-mini-btn ${allDayActive ? "active" : ""}`}
                      disabled={readOnly}
                      onClick={() => {
                        setSelectedDay(day);
                        toggleAllDay(day);
                      }}
                    >
                      All day
                      {allDayActive ? <span className="availability-mini-check" aria-hidden="true">✓</span> : null}
                    </button>
                    <button
                      type="button"
                      className="availability-mini-btn"
                      disabled={readOnly}
                      onClick={() => {
                        setSelectedDay(day);
                        applyPresetToDay(day, "08:00", "23:00", "remove");
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {isCondensedView ? (
          <div className="availability-mobile-nav">
            <button type="button" className="availability-btn" onClick={() => changeSelectedDay(-1)}>
              Prev day
            </button>
            <div className="availability-mobile-days">
              {WEEK_DAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  className={`availability-btn ${selectedDay === day ? "primary" : ""}`}
                  onClick={() => setSelectedDay(day)}
                >
                  {day}
                </button>
              ))}
            </div>
            <button type="button" className="availability-btn" onClick={() => changeSelectedDay(1)}>
              Next day
            </button>
          </div>
        ) : null}

        <div className="availability-frame">
          <div className={`availability-grid ${isCondensedView ? "single-day" : ""}`}>
            <div className="availability-head availability-corner" />
            {visibleDays.map((day) => (
              <div key={day} className="availability-head">
                <strong>{day}</strong>
                <span>{ready && (value?.slots?.[day]?.length || 0) > 0 ? "Free time saved" : "Tap to mark"}</span>
              </div>
            ))}

            {TIME_BLOCKS.map((time) => (
              <AvailabilityRow
                key={time}
                time={time}
                visibleDays={visibleDays}
                activeBlocks={activeBlocks}
                dragMode={dragMode}
                readOnly={readOnly}
                recentlyToggledKey={recentlyToggledKey}
                onMouseDown={startDrag}
                onMouseEnter={continueDrag}
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

function AvailabilityRow({ time, visibleDays, activeBlocks, dragMode, readOnly, recentlyToggledKey, onMouseDown, onMouseEnter }) {
  return (
    <>
      <div className="availability-time">{formatTimeLabel(time)}</div>
      {visibleDays.map((day) => {
        const key = `${day}-${time}`;
        return (
          <div
            key={key}
            className={`availability-slot ${activeBlocks.has(key) ? "active" : ""} ${dragMode ? "dragging" : ""} ${recentlyToggledKey === key ? "recent" : ""}`}
            style={{ cursor: readOnly ? "default" : "pointer" }}
            data-availability-slot="true"
            data-day={day}
            data-time={time}
            onMouseDown={() => !readOnly && onMouseDown(day, time)}
            onMouseEnter={() => !readOnly && onMouseEnter(day, time)}
            onTouchStart={() => !readOnly && onMouseDown(day, time)}
          >
            <span className="availability-slot-indicator" aria-hidden="true">✓</span>
          </div>
        );
      })}
    </>
  );
}
