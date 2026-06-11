const CONFETTI_PIECES = [
  ["6%", "14s", "-2s", "#d98b7f", "10px", "4px", "18deg"],
  ["11%", "18s", "-9s", "#ffd93d", "8px", "8px", "42deg"],
  ["16%", "15s", "-5s", "#4ecdc4", "12px", "5px", "-12deg"],
  ["21%", "19s", "-12s", "#6ed7ff", "7px", "12px", "68deg"],
  ["26%", "13s", "-7s", "#ff9a3c", "11px", "4px", "25deg"],
  ["31%", "17s", "-3s", "#c6a6ff", "9px", "9px", "-36deg"],
  ["36%", "16s", "-10s", "#51cf66", "13px", "5px", "58deg"],
  ["41%", "20s", "-1s", "#ff6b9d", "8px", "11px", "-22deg"],
  ["46%", "14s", "-8s", "#ffd93d", "12px", "4px", "76deg"],
  ["51%", "18s", "-14s", "#4ecdc4", "7px", "10px", "10deg"],
  ["56%", "15s", "-4s", "#d98b7f", "10px", "6px", "-54deg"],
  ["61%", "21s", "-11s", "#6ed7ff", "9px", "9px", "36deg"],
  ["66%", "13s", "-6s", "#ff9a3c", "12px", "5px", "-18deg"],
  ["71%", "17s", "-13s", "#51cf66", "7px", "12px", "64deg"],
  ["76%", "19s", "-2s", "#c6a6ff", "10px", "10px", "-44deg"],
  ["81%", "15s", "-9s", "#ff6b9d", "12px", "4px", "28deg"],
  ["86%", "18s", "-5s", "#ffd93d", "8px", "13px", "-8deg"],
  ["91%", "14s", "-12s", "#4ecdc4", "11px", "5px", "52deg"],
  ["96%", "20s", "-7s", "#d98b7f", "8px", "8px", "-30deg"],
  ["3%", "22s", "-15s", "#6ed7ff", "10px", "4px", "72deg"],
  ["13%", "16s", "-16s", "#51cf66", "7px", "11px", "-48deg"],
  ["23%", "23s", "-18s", "#ff9a3c", "12px", "5px", "16deg"],
  ["33%", "18s", "-20s", "#c6a6ff", "9px", "9px", "40deg"],
  ["43%", "21s", "-17s", "#ff6b9d", "11px", "4px", "-20deg"],
  ["53%", "17s", "-19s", "#ffd93d", "8px", "12px", "60deg"],
  ["63%", "24s", "-21s", "#4ecdc4", "12px", "5px", "-34deg"],
  ["73%", "16s", "-15s", "#d98b7f", "9px", "9px", "24deg"],
  ["83%", "22s", "-18s", "#6ed7ff", "10px", "4px", "-58deg"],
  ["93%", "19s", "-22s", "#51cf66", "7px", "11px", "46deg"],
];

export default function OutsidersConfettiBackground() {
  return (
    <div className="outsiders-confetti-background" aria-hidden="true">
      {CONFETTI_PIECES.map(([left, duration, delay, color, width, height, rotate], index) => (
        <span
          key={`${left}-${duration}-${index}`}
          className="outsiders-confetti-piece"
          style={{
            "--confetti-left": left,
            "--confetti-duration": duration,
            "--confetti-delay": delay,
            "--confetti-color": color,
            "--confetti-width": width,
            "--confetti-height": height,
            "--confetti-rotate": rotate,
          }}
        />
      ))}
    </div>
  );
}
