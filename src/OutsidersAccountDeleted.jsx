const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Nunito:wght@400;700;800;900&display=swap');
  * { box-sizing: border-box; }
  body { margin: 0; background: #fffdf9; }

  .deleted-root {
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 24px;
    background: #fffdf9;
    font-family: 'Nunito', sans-serif;
    color: #1a1a2e;
    position: relative;
    overflow: hidden;
  }

  .deleted-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: radial-gradient(circle, #1a1a2e 1px, transparent 1px);
    background-size: 20px 20px;
    opacity: 0.04;
    pointer-events: none;
  }

  .deleted-card {
    width: min(640px, 100%);
    background: #fff;
    border: 4px solid #1a1a2e;
    border-radius: 22px;
    box-shadow: 10px 10px 0 #1a1a2e;
    padding: 36px 30px;
    text-align: center;
    position: relative;
    z-index: 1;
  }

  .deleted-badge {
    width: 72px;
    height: 72px;
    border-radius: 18px;
    border: 4px solid #1a1a2e;
    background: #d98b7f;
    color: #fff;
    display: grid;
    place-items: center;
    margin: 0 auto 14px;
    box-shadow: 5px 5px 0 #1a1a2e;
    font: 400 34px 'Bangers', cursive;
  }

  .deleted-title {
    margin: 0 0 10px;
    font: 400 48px 'Bangers', cursive;
    letter-spacing: 0.04em;
  }

  .deleted-copy {
    margin: 0 auto;
    max-width: 520px;
    font-size: 16px;
    line-height: 1.7;
    font-weight: 800;
    color: #4a4a68;
  }

  .deleted-actions {
    margin-top: 24px;
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .deleted-btn {
    border: 3px solid #1a1a2e;
    border-radius: 10px;
    padding: 12px 18px;
    cursor: pointer;
    font: 400 19px 'Bangers', cursive;
    letter-spacing: 0.06em;
    box-shadow: 4px 4px 0 #1a1a2e;
    transition: transform 120ms ease, box-shadow 120ms ease;
  }

  .deleted-btn:hover {
    transform: translate(-1px, -2px);
    box-shadow: 6px 6px 0 #1a1a2e;
  }

  .deleted-btn.primary {
    background: #d98b7f;
    color: #fff;
  }

  .deleted-btn.secondary {
    background: #ffd93d;
    color: #1a1a2e;
  }
`;

export default function OutsidersAccountDeleted({ onNavigate }) {
  return (
    <>
      <style>{STYLES}</style>
      <main className="deleted-root">
        <section className="deleted-card">
          <div className="deleted-badge">BYE</div>
          <h1 className="deleted-title">Account Deleted</h1>
          <p className="deleted-copy">
            Your account and profile were removed successfully. Your local app session has been cleared too.
          </p>
          <div className="deleted-actions">
            <button type="button" className="deleted-btn primary" onClick={() => onNavigate?.("signup")}>Create New Account</button>
            <button type="button" className="deleted-btn secondary" onClick={() => onNavigate?.("landing")}>Back To Home</button>
          </div>
        </section>
      </main>
    </>
  );
}
