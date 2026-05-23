import { useMemo, useState } from "react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Sora:wght@600;700;800&display=swap');
  * { box-sizing: border-box; }
  body { margin: 0; background: #f6f3eb; }
  .root {
    min-height: 100vh;
    font-family: 'Space Grotesk', sans-serif;
    color: #1d2238;
    background:
      radial-gradient(circle at top left, rgba(255, 122, 107, 0.16), transparent 25%),
      radial-gradient(circle at top right, rgba(123, 214, 255, 0.22), transparent 24%),
      linear-gradient(180deg, #fff9ef 0%, #f7f3eb 100%);
    display: grid;
    place-items: center;
    padding: 24px;
  }
  .card {
    width: min(560px, 100%);
    border-radius: 30px;
    border: 1px solid rgba(29,34,56,0.1);
    background: rgba(255,255,255,0.86);
    backdrop-filter: blur(18px);
    box-shadow: 0 24px 56px rgba(29,34,56,0.08);
    padding: 28px;
  }
  .code-input {
    width: 100%;
    border: 1px solid rgba(29,34,56,0.12);
    border-radius: 22px;
    padding: 18px;
    text-align: center;
    letter-spacing: 0.25em;
    font: 800 28px 'Sora', sans-serif;
    color: #1d2238;
    background: rgba(255,255,255,0.94);
    outline: none;
    text-transform: uppercase;
  }
  .btn {
    border: none;
    border-radius: 18px;
    padding: 14px 16px;
    cursor: pointer;
    font: 700 14px 'Space Grotesk', sans-serif;
    transition: transform 160ms ease, box-shadow 160ms ease;
  }
  .btn:hover { transform: translateY(-2px); }
  .primary {
    background: linear-gradient(135deg, #ff7a6b, #ff9671);
    color: white;
    box-shadow: 0 18px 32px rgba(255,122,107,0.28);
  }
  .ghost {
    background: rgba(255,255,255,0.9);
    color: #1d2238;
    border: 1px solid rgba(29,34,56,0.12);
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
              <div style={{ display: "inline-flex", padding: "8px 12px", borderRadius: 999, background: "#fff0c2", color: "#7b4e12", fontWeight: 700 }}>Got an invite?</div>
              <h1 style={{ margin: "14px 0 8px", font: "800 36px 'Sora', sans-serif" }}>Join a hangout proposal</h1>
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
              <div style={{ display: "inline-flex", padding: "8px 12px", borderRadius: 999, background: "#eefdf5", color: "#0f766e", fontWeight: 700 }}>Joined</div>
              <h1 style={{ margin: "14px 0 8px", font: "800 36px 'Sora', sans-serif" }}>{joined.name}</h1>
              <p style={{ margin: "0 0 10px", color: "#667085" }}>This invite belongs to {joined.groupName}. The crew can keep managing votes and outside invites in the crew page.</p>
              <div style={{ borderRadius: 22, padding: 16, background: "#fff8ef", border: "1px solid rgba(29,34,56,0.08)" }}>
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
