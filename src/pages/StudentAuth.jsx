import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, setToken } from "../lib/api";
import { Field, PhotoUpload } from "../components/ui";
import { PaymentButton } from "../components/PaymentButton";
import { getFloorPlan } from "../lib/floorPlans";
import { SeatGrid } from "../components/SeatGrid";

const HALLS = [
  { slug: "nice", name: "Nice Study Hall" },
  { slug: "nandi", name: "Nandi Study Hall" },
  { slug: "nicecl", name: "Nice CL Study Hall" },
];

const RULES_TEXT = `1. Maintain silence at all times inside the study hall.
2. Food and beverages are not allowed at your seat.
3. Your seat is personal and non-transferable to another person.
4. Keep your belongings secure — the hall is not responsible for lost items.
5. Monthly fee is due by the 5th of each month. A fine of ₹25/day applies after the 5th.
6. Misuse of shared facilities may lead to seat cancellation.
7. Carry a valid ID when asked by hall staff.
8. Advance/deposit paid at joining is non-refundable unless you vacate with at least a week's notice before the new month.`;

export default function StudentAuth() {
  const [tab, setTab] = useState("login");
  const nav = useNavigate();

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.14em", color: "var(--brass-deep)", textTransform: "uppercase", marginBottom: 10 }}>
          Study hall administration
        </div>
        <div style={{ display: "inline-flex", border: "1px solid var(--line)", borderRadius: 8, overflow: "hidden", marginBottom: 20 }}>
          <button onClick={() => setTab("login")} style={{ background: tab === "login" ? "var(--ink)" : "transparent", color: tab === "login" ? "var(--parchment)" : "var(--ink-soft)", border: "none", padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Log in</button>
          <button onClick={() => setTab("signup")} style={{ background: tab === "signup" ? "var(--ink)" : "transparent", color: tab === "signup" ? "var(--parchment)" : "var(--ink-soft)", border: "none", padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Sign up</button>
        </div>
        {tab === "login" ? <LoginForm /> : <SignupWizard />}
        <div style={{ textAlign: "center", marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
          <Link to="/" className="link-btn">← Back</Link>
        </div>
      </div>
    </div>
  );
}

function LoginForm() {
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

  return (
    <div>
      <div style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 18 }}>Use the mobile number and password you signed up with.</div>
      <Field label="Mobile number"><input className="field-input" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))} /></Field>
      <Field label="Password"><input type="password" className="field-input" value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
      {err && <div className="err-box">{err}</div>}
      <button disabled={busy} onClick={submit} className="btn-primary" style={{ width: "100%" }}>Log in</button>
    </div>
  );
}

function SignupWizard() {
  const [step, setStep] = useState("details");
  const [form, setForm] = useState({
    name: "", photoUrl: "", dob: "", gender: "", mobile: "", aadhar: "", aadharPhotoUrl: "", password: "", hallSlug: "",
    email: "", qualification: "", category: "", occupation: "", guardianName: "", guardianOccupation: "", guardianMobile: "", address: "", pincode: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [err, setErr] = useState("");
  const [vacantSeats, setVacantSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [feeInfo, setFeeInfo] = useState(null);
  const [submitted, setSubmitted] = useState(null);
  const nav = useNavigate();

  const PASSWORD_RULES = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

  async function goToSeatStep() {
    if (!form.name.trim() || !form.photoUrl || !form.dob || !form.gender || !form.mobile || !form.aadhar || !form.aadharPhotoUrl || !form.hallSlug) {
      setErr("All fields are required, including both photos and choosing a study hall."); return;
    }
    if (!/^\d{10}$/.test(form.mobile)) { setErr("Mobile number must be exactly 10 digits."); return; }
    if (!/^\d{12}$/.test(form.aadhar)) { setErr("Aadhar number must be exactly 12 digits."); return; }
    if (!PASSWORD_RULES.test(form.password)) { setErr("Password must be 8+ chars with uppercase, lowercase, a number, and a special character."); return; }
    if (form.password !== confirmPassword) { setErr("Passwords don't match."); return; }
    if (!accepted) { setErr("Please accept the rules and regulations to continue."); return; }
    setErr("");
    const seats = await api.vacantSeats(form.hallSlug);
    setVacantSeats(seats);
    setStep("seat");
  }

  function pickSeat(seat) {
    setSelectedSeat(seat);
    const advance = Number(seat.advance_amount), fee = Number(seat.fee_amount);
    const d = new Date();
    const dim = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    const remaining = dim - d.getDate() + 1;
    const prorated = Math.round((fee / dim) * remaining);
    setFeeInfo({ advance, prorated, total: advance + prorated, remaining, dim, isLocker: seat.is_locker });
    setStep("payment");
  }

  async function afterPaid() {
    try {
      const res = await api.studentSignup({
        hallSlug: form.hallSlug, seatNumber: selectedSeat.seat_number,
        name: form.name, dob: form.dob, gender: form.gender, mobile: form.mobile,
        aadhar: form.aadhar, photoUrl: form.photoUrl, aadharPhotoUrl: form.aadharPhotoUrl,
        password: form.password, email: form.email, qualification: form.qualification,
        category: form.category, occupation: form.occupation, guardianName: form.guardianName,
        guardianOccupation: form.guardianOccupation, guardianMobile: form.guardianMobile,
        address: form.address, pincode: form.pincode,
      });
      setSubmitted({ name: form.name, seatNumber: selectedSeat.seat_number });
    } catch (e) { setErr(e.message); setStep("payment"); }
  }

  if (submitted) {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 24, marginBottom: 10 }}>Application pending</div>
        <div style={{ fontSize: 13.5, color: "var(--ink-soft)", marginBottom: 24, lineHeight: 1.6 }}>
          Thanks, {submitted.name}. You reserved seat <b>{submitted.seatNumber}</b> — your admin needs to confirm before it's finalized. Log in anytime with your mobile number and password to check your status.
        </div>
        <button onClick={() => nav("/student/login")} className="btn-primary">Go to login</button>
      </div>
    );
  }

  if (step === "seat") {
    const plan = getFloorPlan(form.hallSlug);
    const vacantSet = new Set(vacantSeats.map((s) => s.seat_number));
    const seatsByNumber = {};
    // Mark every seat NOT in the vacant list as occupied, so the picker only shows real vacancies.
    const allNums = new Set();
    plan.topStrip.forEach((n) => allNums.add(n));
    plan.columns.forEach((c) => c.blocks.forEach((b) => b.rows.forEach((r) => r.forEach((cell) => {
      if (cell != null && cell !== "PILLAR") allNums.add(cell);
    }))));
    allNums.forEach((n) => { if (!vacantSet.has(n)) seatsByNumber[n] = { student_id: "x" }; });

    return (
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, marginBottom: 6 }}>Choose a vacant seat</div>
        <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 12 }}>{vacantSeats.length} seats available</div>
        <SeatGrid
          plan={plan}
          seatsByNumber={seatsByNumber}
          onlyVacant
          onSeatClick={(num) => { const seat = vacantSeats.find((s) => s.seat_number === num); if (seat) pickSeat(seat); }}
        />
        <button onClick={() => setStep("details")} className="link-btn" style={{ marginTop: 14 }}>← Back</button>
      </div>
    );
  }

  if (step === "payment") {
    return (
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, marginBottom: 6 }}>Pay to reserve seat {selectedSeat.seat_number}</div>
        <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 14 }}>
          ₹{feeInfo.advance} advance + ₹{feeInfo.prorated} for {feeInfo.remaining} remaining day(s) this month{feeInfo.isLocker ? " (locker seat)" : ""} = <b>₹{feeInfo.total}</b>
        </div>
        {err && <div className="err-box">{err}</div>}
        <PaymentButton
          amount={feeInfo.total}
          hallId={null}
          seatNumber={selectedSeat.seat_number}
          type="signup"
          prefillName={form.name}
          prefillContact={form.mobile}
          onPaid={afterPaid}
        />
        <div style={{ textAlign: "center", marginTop: 10 }}>
          <button onClick={() => setStep("seat")} className="link-btn">← Choose a different seat</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 14 }}>All fields below are required.</div>
      <Field label="Full name"><input className="field-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></Field>
      <Field label="Your photo"><PhotoUpload label="Take / upload photo" value={form.photoUrl} onChange={(url) => setForm((f) => ({ ...f, photoUrl: url }))} capture folder="profile-photos" /></Field>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}><Field label="Date of birth"><input type="date" className="field-input" value={form.dob} onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))} /></Field></div>
        <div style={{ flex: 1 }}><Field label="Gender">
          <select className="field-input" value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}>
            <option value="">Select</option><option>Male</option><option>Female</option><option>Other</option>
          </select>
        </Field></div>
      </div>
      <Field label="Mobile number"><input className="field-input" value={form.mobile} onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) }))} placeholder="10-digit mobile — this is your login" /></Field>
      <Field label="Password"><input type="password" className="field-input" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} /></Field>
      <div style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: -8, marginBottom: 12 }}>8+ characters with uppercase, lowercase, a number, and a special character.</div>
      <Field label="Confirm password"><input type="password" className="field-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></Field>
      <Field label="Aadhar number"><input className="field-input" value={form.aadhar} onChange={(e) => setForm((f) => ({ ...f, aadhar: e.target.value.replace(/\D/g, "").slice(0, 12) }))} /></Field>
      <Field label="Aadhar card photo"><PhotoUpload label="Upload Aadhar card" value={form.aadharPhotoUrl} onChange={(url) => setForm((f) => ({ ...f, aadharPhotoUrl: url }))} folder="aadhar-cards" /></Field>
      <Field label="Educational qualification"><input className="field-input" value={form.qualification} onChange={(e) => setForm((f) => ({ ...f, qualification: e.target.value }))} /></Field>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}><Field label="Category"><input className="field-input" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} /></Field></div>
        <div style={{ flex: 1 }}><Field label="Occupation"><input className="field-input" value={form.occupation} onChange={(e) => setForm((f) => ({ ...f, occupation: e.target.value }))} /></Field></div>
      </div>
      <Field label="Parent's / Guardian's name"><input className="field-input" value={form.guardianName} onChange={(e) => setForm((f) => ({ ...f, guardianName: e.target.value }))} /></Field>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}><Field label="Guardian's occupation"><input className="field-input" value={form.guardianOccupation} onChange={(e) => setForm((f) => ({ ...f, guardianOccupation: e.target.value }))} /></Field></div>
        <div style={{ flex: 1 }}><Field label="Guardian's mobile"><input className="field-input" value={form.guardianMobile} onChange={(e) => setForm((f) => ({ ...f, guardianMobile: e.target.value.replace(/\D/g, "").slice(0, 10) }))} /></Field></div>
      </div>
      <Field label="Address"><input className="field-input" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} /></Field>
      <Field label="Pin code"><input className="field-input" value={form.pincode} onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) }))} /></Field>
      <Field label="Email"><input type="email" className="field-input" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></Field>
      <Field label="Which study hall?">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {HALLS.map((h) => (
            <label key={h.slug} style={{ display: "flex", alignItems: "center", gap: 8, border: `1px solid ${form.hallSlug === h.slug ? "var(--ink)" : "var(--line)"}`, borderRadius: 8, padding: "9px 12px", cursor: "pointer", fontSize: 13.5 }}>
              <input type="radio" name="hall" checked={form.hallSlug === h.slug} onChange={() => setForm((f) => ({ ...f, hallSlug: h.slug }))} />
              {h.name}
            </label>
          ))}
        </div>
      </Field>
      <Field label="Rules & regulations">
        <div style={{ border: "1px solid var(--line)", borderRadius: 8, padding: 10, maxHeight: 130, overflowY: "auto", fontSize: 12, color: "var(--ink-soft)", whiteSpace: "pre-line", background: "#fff", marginBottom: 8 }}>
          {RULES_TEXT}
        </div>
        <label style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13 }}>
          <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} style={{ marginTop: 2 }} />
          I have read and accept the rules and regulations.
        </label>
      </Field>
      {err && <div className="err-box">{err}</div>}
      <button onClick={goToSeatStep} className="btn-primary" style={{ width: "100%" }}>Continue to seat selection</button>
    </div>
  );
}
