function StudentLoginForm() {
  const [mode, setMode] = useState("login"); // 'login' | 'forgot'
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  async function submit() {
    setErr(""); setBusy(true);
    try {
      const res = await api.studentLogin({ mobile, password });
      if (res.status === "active") {
        setToken("student", res.token);
        nav("/student/portal");
      } else {
        nav("/student/pending", { state: res.application });
      }
    } catch (e) { setErr(e.message); }
    setBusy(false);
  }

  if (mode === "forgot") {
    return <ForgotPasswordForm onDone={() => setMode("login")} />;
  }

  return (
    <div>
      <div style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 18 }}>Use the mobile number and password you signed up with.</div>
      <Field label="Mobile number"><input className="field-input" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))} /></Field>
      <Field label="Password"><input type="password" className="field-input" value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
      {err && <div className="err-box">{err}</div>}
      <button disabled={busy} onClick={submit} className="btn-primary" style={{ width: "100%" }}>Log in</button>
      <div style={{ textAlign: "center", marginTop: 12 }}>
        <button onClick={() => setMode("forgot")} className="link-btn">Forgot password?</button>
      </div>
    </div>
  );
}

function ForgotPasswordForm({ onDone }) {
  const [mobile, setMobile] = useState("");
  const [aadhar, setAadhar] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    if (!/^\d{10}$/.test(mobile)) { setErr("Mobile number must be exactly 10 digits."); return; }
    if (!/^\d{12}$/.test(aadhar)) { setErr("Aadhar number must be exactly 12 digits."); return; }
    if (newPassword.length < 4) { setErr("Password must be at least 4 characters."); return; }
    if (newPassword !== confirmPassword) { setErr("Passwords don't match."); return; }
    setErr(""); setBusy(true);
    try {
      await api.studentForgotPassword({ mobile, aadhar, newPassword });
      setDone(true);
    } catch (e) { setErr(e.message); }
    setBusy(false);
  }

  if (done) {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 14, marginBottom: 16 }}>Password updated. You can log in with your new password now.</div>
        <button onClick={onDone} className="btn-primary">Back to login</button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 18 }}>Enter your mobile number and Aadhar number to verify it's you, then set a new password.</div>
      <Field label="Mobile number"><input className="field-input" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))} /></Field>
      <Field label="Aadhar number"><input className="field-input" value={aadhar} onChange={(e) => setAadhar(e.target.value.replace(/\D/g, "").slice(0, 12))} /></Field>
      <Field label="New password"><input type="password" className="field-input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></Field>
      <Field label="Confirm new password"><input type="password" className="field-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></Field>
      {err && <div className="err-box">{err}</div>}
      <button disabled={busy} onClick={submit} className="btn-primary" style={{ width: "100%" }}>Update password</button>
      <div style={{ textAlign: "center", marginTop: 12 }}>
        <button onClick={onDone} className="link-btn">← Back to login</button>
      </div>
    </div>
  );
}
