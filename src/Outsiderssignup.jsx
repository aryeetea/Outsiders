import { useState, useRef } from "react";
import AvailabilitySheet from "./AvailabilitySheet";
import { isSupabaseConfigured, supabase, supabaseConfigError } from "./supabase";
import { DEFAULT_AVAILABILITY, availabilityToText, hasAvailability } from "./scheduling";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Nunito:wght@400;600;700;800;900&family=Caveat:wght@600;700&display=swap');

  * { box-sizing: border-box; }
  body { background: #fffdf9; margin: 0; }

  .signup-root {
    font-family: 'Nunito', sans-serif;
    background: #fffdf9;
    color: #1a1a2e;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .signup-root::before {
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
    width: 38px;
    height: 38px;
    background: #ff6b6b;
    border: 3px solid #1a1a2e;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
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

  .signup-card {
    background: #fff;
    border: 4px solid #1a1a2e;
    border-radius: 20px;
    box-shadow: 10px 10px 0 #1a1a2e;
    padding: 40px 36px;
    width: 100%;
    max-width: 560px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
  }

  .profile-step {
    background: #fffdf9;
    border: 3px solid #1a1a2e;
    border-radius: 16px;
    padding: 18px;
    box-shadow: 5px 5px 0 #1a1a2e;
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

  .avatar-upload {
    width: 110px;
    height: 110px;
    border-radius: 50%;
    border: 4px dashed #1a1a2e;
    background: #fffdf9;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
    overflow: hidden;
    position: relative;
    box-shadow: 4px 4px 0 #1a1a2e;
  }
  .avatar-upload:hover { border-color: #ff6b6b; background: #fff4f4; }
  .avatar-img { width: 100%; height: 100%; object-fit: cover; }

  .error-msg {
    font-size: 13px;
    font-weight: 800;
    color: #ff6b6b;
    margin-top: 6px;
    font-family: 'Bangers', cursive;
    letter-spacing: 0.04em;
    font-size: 15px;
  }

  .strength-bar {
    height: 8px;
    border-radius: 99px;
    background: #f0ebe0;
    margin-top: 8px;
    overflow: hidden;
    border: 2px solid #1a1a2e;
  }
  .strength-fill {
    height: 100%;
    border-radius: 99px;
    transition: width 0.3s, background 0.3s;
  }

  .link {
    color: #ff6b6b;
    font-weight: 900;
    text-decoration: none;
    cursor: pointer;
    font-family: 'Bangers', cursive;
    font-size: 17px;
    letter-spacing: 0.04em;
  }
  .link:hover { text-decoration: underline; }

  .shape {
    position: absolute;
    pointer-events: none;
  }

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
    display: inline-block;
  }

  @media (max-width: 640px) {
    .signup-card { padding: 30px 20px; }
  }
`;

const IconLogoMark = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
    <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" fill="white"/>
  </svg>
);
const IconCamera = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
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

function getPasswordStrength(pw) {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: "", color: "#f0ebe0" },
    { label: "Weak 😬", color: "#ff6b6b" },
    { label: "Okay 🤔", color: "#ffd93d" },
    { label: "Good 👍", color: "#4ecdc4" },
    { label: "Strong 💪", color: "#51cf66" },
  ];
  return { score, ...map[score] };
}

export default function OutsidersSignUp({ onNavigate, setAppData, routeParams }) {
  const [avatar, setAvatar] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
  const [availability, setAvailability] = useState(DEFAULT_AVAILABILITY);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();
  const strength = getPasswordStrength(form.password);
  const inviteParams = routeParams?.groupCode ? { groupCode: routeParams.groupCode } : {};
  const postAuthScreen = routeParams?.redirect || "dashboard";
  const availabilitySummary = availabilityToText(availability);

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatar(URL.createObjectURL(file));
      setErrors(prev => ({ ...prev, avatar: "" }));
    }
  };
  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  };
  const validate = () => {
    const errs = {};
    if (!avatar) errs.avatar = "Add a photo so your crew knows it's you!";
    if (!form.name.trim()) errs.name = "We need your name!";
    if (!form.username.trim()) errs.username = "Pick a username!";
    else if (form.username.includes(" ")) errs.username = "No spaces in username!";
    if (!form.email.trim()) errs.email = "Email is required!";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "That doesn't look like an email!";
    if (!form.password) errs.password = "Password is required!";
    else if (form.password.length < 8) errs.password = "At least 8 characters!";
    if (!hasAvailability(availability)) errs.availability = "Add at least one day and time you are free!";
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

    const cleanUsername = form.username.trim().replace(/^@/, "").toLowerCase();
    const { data, error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: {
          full_name: form.name.trim(),
          username: cleanUsername,
          availability,
        },
      },
    });

    if (error) {
      setErrors({ submit: error.message });
      setLoading(false);
      return;
    }

    if (data.user && data.session) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: form.name.trim(),
        username: cleanUsername,
        email: form.email.trim(),
        availability,
      });

      if (profileError) {
        setErrors({ submit: profileError.message });
        setLoading(false);
        return;
      }
    }

    if (avatarFile) {
      console.info("Avatar selected for future Supabase Storage upload:", avatarFile.name);
    }

    setLoading(false);
    if (!data.session) {
      window.alert("Account created. Check your email to confirm it, then log in.");
      onNavigate?.("login", { redirect: postAuthScreen, ...inviteParams });
      return;
    }

    // Immediately apply the signup profile data so the availability gate never flashes
    setAppData?.((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        name: form.name.trim(),
        username: cleanUsername,
        email: form.email.trim(),
        availability,
      },
      avatar: avatar || prev.avatar || null,
    }));

    onNavigate?.(postAuthScreen, inviteParams);
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="signup-root">

        {/* Nav */}
        <nav className="nav-bar">
          <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px", height: 68, display: "flex", alignItems: "center" }}>
            <button type="button" className="logo-link" onClick={() => onNavigate?.("landing")} aria-label="Go to home">
              <div className="logo-mark"><IconLogoMark /></div>
              <span className="bangers" style={{ fontSize: 26, color: "#1a1a2e" }}>Outsiders</span>
            </button>
          </div>
        </nav>

        {/* Main */}
        <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px", position: "relative", overflow: "hidden" }}>

          {/* Floating shapes */}
          <div className="shape" style={{ top: 30, left: "5%", width: 52, height: 52, background: "#ffd93d", border: "3px solid #1a1a2e", borderRadius: "50%", boxShadow: "5px 5px 0 #1a1a2e" }} />
          <div className="shape" style={{ top: 80, right: "7%", width: 42, height: 42, background: "#4ecdc4", border: "3px solid #1a1a2e", borderRadius: "10px", transform: "rotate(15deg)", boxShadow: "4px 4px 0 #1a1a2e" }} />
          <div className="shape" style={{ bottom: 60, left: "8%", width: 36, height: 36, background: "#a29bfe", border: "3px solid #1a1a2e", borderRadius: "50%", boxShadow: "4px 4px 0 #1a1a2e" }} />
          <div className="shape" style={{ bottom: 40, right: "5%", width: 48, height: 48, background: "#ff6b9d", border: "3px solid #1a1a2e", borderRadius: "10px", transform: "rotate(-12deg)", boxShadow: "4px 4px 0 #1a1a2e" }} />

          <div className="signup-card">

            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <span className="comic-tag">New here? Welcome!</span>
              <h1 className="bangers" style={{ fontSize: 38, color: "#1a1a2e", margin: "0 0 8px" }}>
                Join The Crew 🎉
              </h1>
              <p style={{ fontSize: 14, color: "#888", fontWeight: 700, margin: 0 }}>
                Set up your profile and find your people.
              </p>
            </div>

            {/* Avatar */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28 }}>
              <div className="avatar-upload" onClick={() => fileRef.current.click()}>
                {avatar
                  ? <img src={avatar} alt="avatar" className="avatar-img" />
                  : <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <IconCamera />
                      <span style={{ fontSize: 11, fontWeight: 800, color: "#aaa" }}>Add photo</span>
                    </div>
                }
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatar} />
              {errors.avatar && <p className="error-msg">{errors.avatar}</p>}
              <span style={{ fontSize: 12, color: "#aaa", fontWeight: 800, marginTop: 8 }}>Tap to upload a photo</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              <div className="profile-step">
                <label className="form-label">Full Name</label>
                <input className="form-input" type="text" placeholder="e.g. Jordan Smith" value={form.name} onChange={handleChange("name")} />
                {errors.name && <p className="error-msg">{errors.name}</p>}
              </div>

              <div className="profile-step">
                <label className="form-label">Username</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontWeight: 900, color: "#aaa", fontSize: 16 }}>@</span>
                  <input className="form-input" type="text" placeholder="yourcoolname" value={form.username} onChange={handleChange("username")} style={{ paddingLeft: 30 }} />
                </div>
                {errors.username && <p className="error-msg">{errors.username}</p>}
              </div>

              <div className="profile-step">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" placeholder="you@email.com" value={form.email} onChange={handleChange("email")} />
                {errors.email && <p className="error-msg">{errors.email}</p>}
              </div>

              <div className="profile-step">
                <label className="form-label">Password</label>
                <div style={{ position: "relative" }}>
                  <input className="form-input" type={showPassword ? "text" : "password"} placeholder="Min. 8 characters" value={form.password} onChange={handleChange("password")} style={{ paddingRight: 44 }} />
                  <button onClick={() => setShowPassword(s => !s)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
                    <IconEye show={showPassword} />
                  </button>
                </div>
                {form.password && (
                  <div>
                    <div className="strength-bar">
                      <div className="strength-fill" style={{ width: `${(strength.score / 4) * 100}%`, background: strength.color }} />
                    </div>
                    <span className="bangers" style={{ fontSize: 14, color: strength.color, letterSpacing: "0.04em" }}>{strength.label}</span>
                  </div>
                )}
                {errors.password && <p className="error-msg">{errors.password}</p>}
              </div>

              <AvailabilitySheet
                value={availability}
                onChange={(nextAvailability) => {
                  setAvailability(nextAvailability);
                  setErrors((prev) => ({ ...prev, availability: "" }));
                }}
                title="Set your availability before you join"
                subtitle="Signing up users get their own dedicated availability section too. Fill this out now so your crew can vote and plan around your real schedule from day one."
                required
                compact
              />
              {errors.availability && <p className="error-msg">{errors.availability}</p>}
              <div style={{ background: "#fff", border: "3px solid #1a1a2e", borderRadius: 12, padding: "12px 14px", boxShadow: "3px 3px 0 #1a1a2e", fontSize: 13, fontWeight: 800, color: "#555" }}>
                <span className="bangers" style={{ display: "block", fontSize: 13, color: "#4ecdc4", marginBottom: 4 }}>Saved to your profile</span>
                {availabilitySummary}
              </div>

              {errors.submit && <p className="error-msg" style={{ margin: 0 }}>{errors.submit}</p>}

              <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ marginTop: 8, opacity: loading ? 0.7 : 1 }}>
                {loading ? "Creating Account..." : "Create My Account 🚀"}
              </button>

              <p style={{ textAlign: "center", fontSize: 14, fontWeight: 800, color: "#888", margin: 0 }}>
                Already have an account? <a className="link" onClick={() => onNavigate?.("login", { redirect: postAuthScreen, ...inviteParams })}>Log In</a>
              </p>

            </div>
          </div>
        </main>
      </div>
    </>
  );
}
