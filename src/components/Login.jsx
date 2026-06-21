import { useState } from "react";
import { api } from "../api";
import { toast } from "../toast";
import { Icon } from "./icons";

const POINTS = [
  "Borrow & lend everyday hostel items",
  "Buy & sell second-hand gear, fast",
  "Post requests and run a Lost & Found board",
  "Verified students, ratings & instant pickup",
];

export default function Login({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [campus, setCampus] = useState("IIT Bombay · Hostel 12");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isRegister = mode === "register";

  const submit = async () => {
    setError("");
    if (isRegister && !name.trim()) return setError("Enter your name.");
    if (!/^[0-9]{10}$/.test(contact)) return setError("Enter a valid 10-digit contact number.");
    if (password.length < 4) return setError("Password must be at least 4 characters.");
    setLoading(true);
    try {
      const data = isRegister
        ? await api.register({ name, campus, contact, password })
        : await api.login({ contact, password });
      toast(isRegister ? `Welcome to HareIt, ${data.user.name}!` : "Welcome back!");
      onLogin({ token: data.access_token, user: data.user });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e) => e.key === "Enter" && submit();

  return (
    <div className="auth">
      <aside className="auth-brand">
        <div className="brand">
          <div className="brand-mark">H</div>
          <span className="brand-name">HareIt</span>
        </div>
        <h1 className="auth-hero">Your hostel's own marketplace.</h1>
        <p className="auth-sub">
          Borrow, lend, buy and sell with students in your hostel — friendly, verified, and free.
        </p>
        <ul className="auth-points">
          {POINTS.map((p) => (
            <li key={p}>
              <span className="tick">
                <Icon name="check" size={15} sw={3} />
              </span>
              {p}
            </li>
          ))}
        </ul>
      </aside>

      <div className="auth-form-wrap">
        <div className="auth-card">
          <h2>{isRegister ? "Create your account" : "Welcome back"}</h2>
          <p className="muted">For hostel students.</p>

          {error && <div className="form-error">{error}</div>}

          {isRegister && (
            <div className="field">
              <label>Full name</label>
              <input placeholder="e.g. Yash Mehta" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={onKey} />
            </div>
          )}
          {isRegister && (
            <div className="field">
              <label>Campus · Hostel</label>
              <input placeholder="IIT Bombay · Hostel 12" value={campus} onChange={(e) => setCampus(e.target.value)} onKeyDown={onKey} />
            </div>
          )}
          <div className="field">
            <label>Contact number</label>
            <input inputMode="numeric" placeholder="10-digit mobile number" value={contact} onChange={(e) => setContact(e.target.value)} onKeyDown={onKey} />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" placeholder={isRegister ? "Choose a password" : "Your password"} value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={onKey} />
          </div>

          <button className="btn-primary" style={{ width: "100%", justifyContent: "center", height: 48 }} onClick={submit} disabled={loading}>
            {loading ? "Please wait…" : isRegister ? "Create account" : "Log in"}
          </button>

          <p className="auth-toggle">
            {isRegister ? "Already have an account?" : "New to HareIt?"}{" "}
            <button onClick={() => { setMode(isRegister ? "login" : "register"); setError(""); }}>
              {isRegister ? "Log in" : "Create one"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
