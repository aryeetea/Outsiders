import { useMemo, useState } from "react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Nunito:wght@400;600;700;800;900&display=swap');
  * { box-sizing: border-box; }
  body { margin: 0; background: #f7f1dd; }
  .root {
    min-height: 100vh;
    font-family: 'Nunito', sans-serif;
    color: #17151f;
    background:
      radial-gradient(circle at top left, rgba(255, 217, 61, 0.46), transparent 28%),
      radial-gradient(circle at top right, rgba(110, 215, 255, 0.24), transparent 24%),
      linear-gradient(180deg, #fff7cc 0%, #fffef6 40%, #f5efe0 100%);
    display: grid;
    place-items: center;
    padding: 24px;
    position: relative;
  }
  .root::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: radial-gradient(circle, rgba(23, 21, 31, 0.14) 1.1px, transparent 1.3px);
    background-size: 22px 22px;
    opacity: 0.5;
    pointer-events: none;
    z-index: 0;
  }
  .card {
    width: min(560px, 100%);
    border-radius: 22px;
    border: 4px solid #17151f;
    background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,250,240,0.98));
    box-shadow: 8px 8px 0 #17151f;
    padding: 28px;
    position: relative;
    overflow: hidden;
    z-index: 1;
  }
  .card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at top right, rgba(255,255,255,0.64), transparent 28%);
    pointer-events: none;
  }
  .code-input {
    width: 100%;
    border: 3px solid #17151f;
    border-radius: 14px;
    padding: 18px;
    text-align: center;
    letter-spacing: 0.25em;
    font: 400 30px 'Bangers', cursive;
    color: #17151f;
    background: linear-gradient(180deg, #fffef8, #fff7e4);
    outline: none;
    text-transform: uppercase;
    box-shadow: 4px 4px 0 #17151f;
  }
  .code-input:focus {
    border-color: #ff6b6b;
    box-shadow: 5px 5px 0 #ff6b6b;
  }
  .btn {
    border: 3px solid #17151f;
    border-radius: 12px;
    padding: 14px 16px;
    cursor: pointer;
    font: 400 14px 'Bangers', cursive;
    letter-spacing: 0.06em;
    transition: transform 160ms ease, box-shadow 160ms ease;
    box-shadow: 4px 4px 0 #17151f;
    position: relative;
    z-index: 1;
  }
  .btn:hover { transform: translate(-1px, -2px); }
  .primary {
    background: linear-gradient(135deg, #ff6b6b, #ff8b6b);
    color: white;
  }
  .ghost {
    background: linear-gradient(180deg, #ffffff, #fff3c8);
    color: #17151f;
  }
  .bangers {
    font-family: 'Bangers', cursive;
    letter-spacing: 0.04em;
  }
  .comic-kicker {
    display: inline-flex;
    padding: 6px 12px;
    border-radius: 10px;
    background: #ffd93d;
    color: #17151f;
    font: 400 15px 'Bangers', cursive;
    letter-spacing: 0.07em;
    border: 2px solid #17151f;
    box-shadow: 3px 3px 0 #17151f;
    transform: rotate(-2deg);
  }
  .detail-box {
    border-radius: 18px;
    padding: 16px;
    background: linear-gradient(180deg, #fff7de, #fffef9);
    border: 3px solid #17151f;
    box-shadow: 5px 5px 0 #17151f;
  }
  .status-chip {
    display: inline-flex;
    padding: 8px 12px;
    border-radius: 999px;
    border: 3px solid #17151f;
    box-shadow: 3px 3px 0 #17151f;
    font-weight: 900;
  }
`;

export default function OutsidersJoinHangout({ onNavigate, appData, setAppData }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [joinedId, setJoinedId] = useState(null);

  const allProposals = useMemo(
    () => (appData?.groups || []).flatMap((group) => (group.hangoutProposals || []).map((proposal) => ({ ...proposal, groupId: group.id, groupName: group.name }))),
    [appData]
  );
  const joined = allProposals.find((proposal) => proposal.id === joinedId) || null;

  const handleJoin = () => {
    const normalized = code.trim().toUpperCase();
    const match = allProposals.find((proposal) => proposal.code?.toUpperCase() === normalized);
    if (!match) {
      setError("That invite code does not match a hangout proposal.");
      return;
    }
    setAppData?.((prev) => ({
      ...prev,
      groups: prev.groups.map((group) => (
        group.id === match.groupId
          ? {
              ...group,
              hangoutProposals: group.hangoutProposals.map((proposal) => (
                proposal.id === match.id
                  ? {
                      ...proposal,
                      externalInvites: proposal.externalInvites?.includes("Guest joined via code")
                        ? proposal.externalInvites
                        : [...(proposal.externalInvites || []), "Guest joined via code"],
                    }
                  : proposal
              )),
            }
          : group
      )),
    }));
    setJoinedId(match.id);
    setError("");
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="root">
        <div className="card">
          {!joined ? (
            <>
              <div className="comic-kicker">Got An Invite?</div>
              <h1 className="bangers" style={{ margin: "14px 0 8px", fontSize: 40 }}>Join a hangout proposal</h1>
              <p style={{ margin: "0 0 18px", color: "#667085", lineHeight: 1.6 }}>Paste the 6-character proposal code to open the hangout context your crew sent you.</p>
              <input className="code-input" value={code} onChange={(event) => { setCode(event.target.value.toUpperCase()); setError(""); }} maxLength={6} placeholder="ABC123" />
              {error ? <p style={{ margin: "12px 0 0", color: "#b42318", fontWeight: 700 }}>{error}</p> : null}
              <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
                <button type="button" className="btn primary" onClick={handleJoin}>Join invite</button>
                <button type="button" className="btn ghost" onClick={() => onNavigate?.("dashboard")}>Back</button>
              </div>
            </>
          ) : (
            <>
              <div className="status-chip" style={{ background: "#eefdf5", color: "#0f766e" }}>Joined</div>
              <h1 className="bangers" style={{ margin: "14px 0 8px", fontSize: 40 }}>{joined.name}</h1>
              <p style={{ margin: "0 0 10px", color: "#667085" }}>This invite belongs to {joined.groupName}. The crew can keep managing votes and outside invites in the crew page.</p>
              <div className="detail-box">
                <strong style={{ display: "block", marginBottom: 8 }}>Proposal details</strong>
                <div style={{ color: "#475467", lineHeight: 1.6 }}>{joined.description || "No extra notes were added to this proposal."}</div>
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
                <button type="button" className="btn primary" onClick={() => onNavigate?.("friend-groups")}>Open crew</button>
                <button type="button" className="btn ghost" onClick={() => onNavigate?.("dashboard")}>Dashboard</button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
