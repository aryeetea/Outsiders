import { useState } from "react";
import { isSupabaseConfigured, supabase, supabaseConfigError } from "./supabase";

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
    max-width: 460px;
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

  .error-msg {
    font-family: 'Bangers', cursive;
    font-size: 15px;
    color: #ff6b6b;
    margin-top: 6px;
    letter-spacing: 0.04em;
  }

  .link {
    color: #ff6b6b;
    font-weight: 900;
    text-decoration: none;
    cursor: pointer;
    font-family: 'Bangers', cursive;
    font-size: 17px;
    letter-spacing: 0.04em;
    background: none;
    border: none;
    padding: 0;
    vertical-align: baseline;
  }
  .link:hover { text-decoration: underline; }

  .forgot-link {
    color: #aaa;
    font-size: 13px;
    font-weight: 800;
    cursor: pointer;
    text-decoration: none;
    float: right;
    margin-top: -4px;
    background: none;
    border: none;
    padding: 0;
    font-family: inherit;
  }
  .forgot-link:hover { color: #ff6b6b; }

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

  .shape { position: absolute; pointer-events: none; }

  .welcome-back {
    background: #e8f4fd;
    border: 3px solid #4ecdc4;
    border-radius: 14px;
    padding: 14px 18px;
    margin-bottom: 24px;
    box-shadow: 4px 4px 0 #4ecdc4;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  @media (max-width: 640px) {
    .card { padding: 28px 20px; }
  }
`;

const IconLogoMark = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
    <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" fill="white"/>
  </svg>
);

const IconEye = ({ show }) => show ? (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

function mapLoginError(message = "") {
  const lower = String(message || "").toLowerCase();
  if (
    lower.includes("load failed")
    || lower.includes("failed to fetch")
    || lower.includes("networkerror")
    || lower.includes("network request failed")
  ) {
    return "Could not reach Supabase. Check your internet connection, Supabase project URL/key, browser blockers, then restart the dev server.";
  }
  if (lower.includes("invalid login credentials")) {
    return "That email or password does not match an account.";
  }
  if (lower.includes("email not confirmed")) {
    return "Check your email and confirm your account first, then try logging in again.";
  }
  if (lower.includes("too many requests")) {
    return "Too many login attempts. Wait a moment and try again.";
  }
  return message || "We could not log you in right now.";
}

function showToast(message, tone = "success", duration = 1300) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("outsiders:toast", {
    detail: { message, tone, duration },
  }));
}

export default function OutsidersLogIn({ onNavigate, setAppData, routeParams }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const inviteParams = {
    ...(routeParams?.groupCode ? { groupCode: routeParams.groupCode } : {}),
    ...(routeParams?.inviteCode ? { inviteCode: routeParams.inviteCode } : {}),
    ...(routeParams?.inviteFor ? { inviteFor: routeParams.inviteFor } : {}),
  };
  const postAuthScreen = routeParams?.redirect || "dashboard";

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = "Email is required!";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "That doesn't look like an email!";
    if (!form.password) errs.password = "Password is required!";
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    if (!isSupabaseConfigured) {
      setErrors({ submit: supabaseConfigError });
      return;
    }

    setLoading(true);
    setErrors({});

    let error = null;
    try {
      ({ error } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      }));
    } catch (caughtError) {
      error = caughtError;
    }

    setLoading(false);
    if (error) {
      setErrors({ submit: mapLoginError(error?.message || String(error)) });
      return;
    }

    showToast("Logged in successfully.");
    onNavigate?.(postAuthScreen, inviteParams);
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="root">

        {/* Nav */}
        <nav className="nav-bar">
          <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <button type="button" className="logo-link" onClick={() => onNavigate?.("landing")} aria-label="Go to home">
              <div className="logo-mark"><IconLogoMark /></div>
              <span className="bangers" style={{ fontSize: 26, color: "#1a1a2e" }}>Outsiders</span>
            </button>
            <span style={{ fontWeight: 800, fontSize: 14, color: "#888" }}>
              No account? <button type="button" className="link" style={{ fontSize: 15 }} onClick={() => onNavigate?.("signup", { redirect: postAuthScreen, ...inviteParams })}>Sign up</button>
            </span>
          </div>
        </nav>

        <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px", position: "relative", overflow: "hidden" }}>

          {/* Floating shapes */}
          <div className="shape" style={{ top: 30, left: "5%", width: 52, height: 52, background: "#ffd93d", border: "3px solid #1a1a2e", borderRadius: "50%", boxShadow: "5px 5px 0 #1a1a2e" }} />
          <div className="shape" style={{ top: 100, right: "7%", width: 42, height: 42, background: "#4ecdc4", border: "3px solid #1a1a2e", borderRadius: "10px", transform: "rotate(15deg)", boxShadow: "4px 4px 0 #1a1a2e" }} />
          <div className="shape" style={{ bottom: 60, left: "8%", width: 36, height: 36, background: "#a29bfe", border: "3px solid #1a1a2e", borderRadius: "50%", boxShadow: "4px 4px 0 #1a1a2e" }} />
          <div className="shape" style={{ bottom: 40, right: "5%", width: 48, height: 48, background: "#ff6b9d", border: "3px solid #1a1a2e", borderRadius: "10px", transform: "rotate(-12deg)", boxShadow: "4px 4px 0 #1a1a2e" }} />
          <div className="shape" style={{ top: "45%", left: "3%", width: 30, height: 30, background: "#51cf66", border: "3px solid #1a1a2e", borderRadius: "8px", transform: "rotate(20deg)", boxShadow: "3px 3px 0 #1a1a2e" }} />

          <div className="card">

            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <span className="comic-tag">Welcome back! 👋</span>
              <h1 className="bangers" style={{ fontSize: 40, color: "#1a1a2e", margin: "0 0 6px" }}>Log Back In</h1>
              <p style={{ fontSize: 14, color: "#888", fontWeight: 700, margin: 0 }}>Your crew is waiting. Don't leave them hanging.</p>
            </div>

            {/* Welcome back banner */}
            <div className="welcome-back">
              <span style={{ fontSize: 28 }}>🎉</span>
              <div>
                <p className="bangers" style={{ fontSize: 15, margin: 0, color: "#1a1a2e", letterSpacing: "0.04em" }}>Your hangouts are waiting!</p>
                <p style={{ fontSize: 12, margin: 0, color: "#666", fontWeight: 700 }}>Log in to see what your crew is planning.</p>
              </div>
            </div>

            {/* Form */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              <div>
                <label className="form-label">📧 Email</label>
                <input className="form-input" type="email" placeholder="you@email.com" value={form.email} onChange={handleChange("email")} />
                <p style={{ fontSize: 12, color: "#888", fontWeight: 700, margin: "8px 0 0" }}>
                  Use the same email you signed up with.
                </p>
                {errors.email && <p className="error-msg">{errors.email}</p>}
              </div>

              <div>
                <label className="form-label">
                  🔒 Password
                  <button type="button" className="forgot-link" onClick={async () => {
                    if (!form.email.trim()) {
                      setErrors(prev => ({ ...prev, email: "Enter your email first." }));
                      return;
                    }
                    if (!isSupabaseConfigured) {
                      setErrors(prev => ({ ...prev, submit: supabaseConfigError }));
                      return;
                    }
                    const { error } = await supabase.auth.resetPasswordForEmail(form.email.trim());
                    window.alert(error ? error.message : "Password reset email sent.");
                  }}>Forgot it?</button>
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    className="form-input"
                    type={showPassword ? "text" : "password"}
                    placeholder="Your password"
                    value={form.password}
                    onChange={handleChange("password")}
                    style={{ paddingRight: 44 }}
                    onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  />
                  <button onClick={() => setShowPassword(s => !s)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
                    <IconEye show={showPassword} />
                  </button>
                </div>
                {errors.password && <p className="error-msg">{errors.password}</p>}
              </div>

              {errors.submit && <p className="error-msg" style={{ margin: 0 }}>{errors.submit}</p>}

              <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ marginTop: 4, opacity: loading ? 0.7 : 1 }}>
                {loading ? "Logging In..." : "Log In 🚀"}
              </button>

              <p style={{ textAlign: "center", fontSize: 14, fontWeight: 800, color: "#888", margin: 0 }}>
                New here? <button type="button" className="link" onClick={() => onNavigate?.("signup", { redirect: postAuthScreen, ...inviteParams })}>Create an account</button>
              </p>

            </div>
          </div>
        </main>
      </div>
    </>
  );
}
