import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, setToken } from "../lib/api";
import { Field } from "../components/ui";

export default function AdminAuth() {
  const [mode, setMode] = useState("login");
  const nav = useNavigate();

  function onSuccess(res) {
    setToken("admin", res.token);
    nav("/admin/halls");
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.14em", color: "var(--brass-deep)", textTransform: "uppercase", marginBottom: 8 }}>
          Study hall administration
        </div>
        {mode === "login" ? <LoginForm onSuccess={onSuccess} onGoSignup={() => setMode("signup")} /> : <SignupForm onSuccess={onSuccess} onGoLogin={() => setMode("login")} />}
        <div style={{ textAlign: "center", marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
          <Link to="/" className="link-btn">← Back</Link>
        </div>
      </div>
    </div>
  );
}

function LoginForm({ onSuccess, onGoSignup }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setErr(""); setBusy(true);
    try {
      const res = await api.adminLogin({ phone, password });
      onSuccess(res);
    } catch (e) { setErr(e.message); }
    setBusy(false);
  }

  return (
    <div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 28, marginBottom: 6 }}>Admin login</div>
      <div style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 22 }}>Log in to manage your study halls.</div>
      <Field label="Phone"><input className="field-input" value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
      <Field label="Password"><input type="password" className="field-input" value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
      {err && <div className="err-box">{err}</div>}
      <button disabled={busy} onClick={submit} className="btn-primary" style={{ width: "100%" }}>Log in</button>
      <div style={{ textAlign: "center", marginTop: 14, fontSize: 12.5 }}>
        <button onClick={onGoSignup} className="link-btn">Create an account</button>
      </div>
    </div>
  );
}

function SignupForm({ onSuccess, onGoLogin }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [orgName, setOrgName] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!name || !phone || !password) { setErr("Name, phone and password are required."); return; }
    if (password !== confirm) { setErr("Passwords don't match."); return; }
    setErr(""); setBusy(true);
    try {
      const res = await api.adminSignup({ name, phone, email, password, organizationName: orgName });
      onSuccess(res);
    } catch (e) { setErr(e.message); }
    setBusy(false);
  }

  return (
    <div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 28, marginBottom: 6 }}>Create admin account</div>
      <div style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 22 }}>The first account for a new organization becomes the <b>master</b> admin.</div>
      <Field label="Organization / business name"><input className="field-input" value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="e.g. Nice Study Centre" /></Field>
      <Field label="Full name"><input className="field-input" value={name} onChange={(e) => setName(e.target.value)} /></Field>
      <Field label="Phone"><input className="field-input" value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
      <Field label="Email (optional)"><input className="field-input" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
      <Field label="Password"><input type="password" className="field-input" value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
      <div style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: -8, marginBottom: 12 }}>8+ characters with uppercase, lowercase, a number, and a special character.</div>
      <Field label="Confirm password"><input type="password" className="field-input" value={confirm} onChange={(e) => setConfirm(e.target.value)} /></Field>
      {err && <div className="err-box">{err}</div>}
      <button disabled={busy} onClick={submit} className="btn-primary" style={{ width: "100%" }}>Create account</button>
      <div style={{ textAlign: "center", marginTop: 14, fontSize: 12.5 }}>
        <button onClick={onGoLogin} className="link-btn">Already have an account? Log in</button>
      </div>
    </div>
  );
}
