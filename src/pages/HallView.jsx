import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api, BASE_URL } from "../lib/api";
import { getFloorPlan } from "../lib/floorPlans";
import { SeatGrid } from "../components/SeatGrid";
import { Field, Modal, useToast, PhotoUpload, LegendDot } from "../components/ui";

export default function HallView() {
  const { slug } = useParams();
  const nav = useNavigate();
  const plan = getFloorPlan(slug);

  const [hall, setHall] = useState(null);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showToast, toastNode] = useToast();

  const [selectedSeat, setSelectedSeat] = useState(null);
  const [modalMode, setModalMode] = useState(null); // 'view' | 'add' | 'empty'
  const [detail, setDetail] = useState(null);

  const [reportsOpen, setReportsOpen] = useState(false);
  const [reports, setReports] = useState(null);
  const [upiOpen, setUpiOpen] = useState(false);
  const [renewalLookupOpen, setRenewalLookupOpen] = useState(false);
  const [renewalSeatInput, setRenewalSeatInput] = useState("");

  const [signupsOpen, setSignupsOpen] = useState(false);
  const [signups, setSignups] = useState([]);
  const [seatChangesOpen, setSeatChangesOpen] = useState(false);
  const [seatChanges, setSeatChanges] = useState([]);
  const [vacatesOpen, setVacatesOpen] = useState(false);
  const [vacates, setVacates] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.hallSeats(slug);
      setHall(res.hall);
      setSeats(res.seats);
    } catch (e) {
      if (e.message.includes("Unauthorized")) nav("/admin/login");
      else showToast(e.message);
    }
    setLoading(false);
  }, [slug, nav, showToast]);

  useEffect(() => { load(); }, [load]);

  const seatsByNumber = {};
  seats.forEach((s) => { seatsByNumber[s.seat_number] = s; });
  const occupiedCount = seats.filter((s) => s.student_id).length;

  async function openSeat(num) {
    setSelectedSeat(num);
    const occ = seatsByNumber[num];
    if (occ && occ.student_id) {
      setModalMode("view");
      const full = await api.seatDetail(slug, num);
      setDetail(full);
    } else {
      setModalMode("empty");
    }
  }
  function closeModal() { setSelectedSeat(null); setModalMode(null); setDetail(null); }

  async function reload() { await load(); }

  return (
    <div style={{ minHeight: "100vh" }}>
      <div style={{ background: "var(--ink)", color: "var(--parchment)", padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div>
          <Link to="/admin/halls" style={{ background: "none", border: "none", color: "var(--brass)", fontFamily: "var(--font-mono)", fontSize: 12, textDecoration: "none", display: "block", marginBottom: 4 }}>← all halls</Link>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 22 }}>{hall ? hall.name : "…"}</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--brass)", marginRight: 6 }}>{occupiedCount} / {seats.length} occupied</div>
          <button onClick={async () => { setReports(await api.reports(slug).catch((e) => { showToast(e.message); return null; })); setReportsOpen(true); }} className="btn-header">Reports</button>
          <button onClick={() => setUpiOpen(true)} className="btn-header">UPI settings</button>
          <button onClick={() => setRenewalLookupOpen(true)} className="btn-header solid">Renewal</button>
          <button onClick={async () => { setSignups(await api.listSignups(slug).catch(() => [])); setSignupsOpen(true); }} className="btn-header">
            Sign-ups{signups.length > 0 ? ` (${signups.length})` : ""}
          </button>
          <button onClick={async () => { setSeatChanges(await api.listSeatChanges(slug).catch(() => [])); setSeatChangesOpen(true); }} className="btn-header">
            Seat changes{seatChanges.length > 0 ? ` (${seatChanges.length})` : ""}
          </button>
          <button onClick={async () => { setVacates(await api.listVacates(slug).catch(() => [])); setVacatesOpen(true); }} className="btn-header">
            Vacate requests{vacates.length > 0 ? ` (${vacates.length})` : ""}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 16px 60px" }}>
        <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
          <LegendDot color="var(--sage)" label="Fee paid" />
          <LegendDot color="var(--rust)" label="Fee due" />
          <LegendDot color="var(--parchment-deep)" label="Vacant" border />
          <LegendDot color="var(--pillar)" label="Pillar / not usable" />
          <LegendDot color="var(--plum)" label="Vacating this month" />
        </div>
        {loading ? <div>Loading…</div> : (
          <SeatGrid plan={plan} seatsByNumber={seatsByNumber} onSeatClick={openSeat} selectedSeat={selectedSeat} />
        )}
      </div>

      {toastNode}

      {modalMode === "empty" && (
        <Modal onClose={closeModal}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Seat {selectedSeat} is vacant</div>
          <button onClick={() => setModalMode("add")} className="btn-primary">Add student to this seat</button>
        </Modal>
      )}

      {modalMode === "add" && (
        <AddStudentModal slug={slug} seatNumber={selectedSeat} onClose={closeModal} onSaved={async () => { await reload(); closeModal(); showToast(`Seat ${selectedSeat} saved`); }} showToast={showToast} />
      )}

      {modalMode === "view" && detail && (
        <SeatDetailModal
          slug={slug} seatNumber={selectedSeat} detail={detail} onClose={closeModal} showToast={showToast}
          onChanged={async () => { await reload(); const full = await api.seatDetail(slug, selectedSeat); setDetail(full); }}
          onVacated={async () => { await reload(); closeModal(); }}
        />
      )}

      {reportsOpen && (
        <Modal onClose={() => setReportsOpen(false)}>
          <ReportsView reports={reports} hallName={hall?.name} />
        </Modal>
      )}

      {upiOpen && hall && (
        <UpiSettingsModal slug={slug} hall={hall} onClose={() => setUpiOpen(false)} onSaved={async () => { await reload(); setUpiOpen(false); }} />
      )}

      {renewalLookupOpen && (
        <Modal onClose={() => setRenewalLookupOpen(false)}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, marginBottom: 10 }}>Renewal — find seat</div>
          <Field label="Seat number">
            <input className="field-input" value={renewalSeatInput} onChange={(e) => setRenewalSeatInput(e.target.value.replace(/\D/g, ""))} onKeyDown={(e) => e.key === "Enter" && document.getElementById("find-seat-btn").click()} />
          </Field>
          <button
            id="find-seat-btn"
            className="btn-primary"
            onClick={() => {
              const num = Number(renewalSeatInput);
              if (!num || !seatsByNumber[num] || !seatsByNumber[num].student_id) { showToast("No student found for that seat number"); return; }
              setRenewalLookupOpen(false); setRenewalSeatInput("");
              openSeat(num);
            }}
          >
            Find seat
          </button>
        </Modal>
      )}

      {signupsOpen && (
        <Modal onClose={() => setSignupsOpen(false)}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, marginBottom: 4 }}>New student sign-ups — {hall?.name}</div>
          <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 14 }}>Students pick their own seat and pay through the gateway. Confirm to finalize, or reject.</div>
          {signups.length === 0 && <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>No pending sign-ups.</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {signups.map((s) => (
              <div key={s.id} className="card">
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                  {s.photo_url ? <img src={s.photo_url.startsWith("http") ? s.photo_url : `${BASE_URL}${s.photo_url}`} alt="" style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover" }} /> : <div style={{ width: 42, height: 42, borderRadius: "50%", background: "var(--brass)" }} />}
                  <div>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15 }}>{s.name} — Seat {s.seat_number}</div>
                    <div style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>DOB {s.dob} · {s.gender} · {s.mobile}</div>
                  </div>
                </div>
                <div style={{ fontSize: 11.5, color: "var(--ink-soft)", marginBottom: 8 }}>Aadhar: {s.aadhar_number} · Fee ₹{s.fee_amount} · Applied {new Date(s.created_at).toLocaleDateString()}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="btn-secondary"
                    onClick={async () => {
                      try { await api.confirmSignup(s.id); showToast(`Confirmed — seat ${s.seat_number} assigned`); setSignups(signups.filter((x) => x.id !== s.id)); await reload(); }
                      catch (e) { showToast(e.message); }
                    }}
                  >
                    Confirm & assign
                  </button>
                  <button className="btn-danger" onClick={async () => { await api.rejectSignup(s.id); setSignups(signups.filter((x) => x.id !== s.id)); showToast(`Rejected application from ${s.name}`); }}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {seatChangesOpen && (
        <Modal onClose={() => setSeatChangesOpen(false)}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, marginBottom: 4 }}>Seat change requests — {hall?.name}</div>
          {seatChanges.length === 0 && <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>No pending requests.</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {seatChanges.map((r) => (
              <div key={r.id} className="card">
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15 }}>{r.name} — Seat {r.from_seat_number} → Seat {r.to_seat_number}</div>
                <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 8 }}>₹{r.amount} · requested {new Date(r.created_at).toLocaleString()}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-secondary" onClick={async () => { try { await api.confirmSeatChange(r.id); showToast("Confirmed"); setSeatChanges(seatChanges.filter((x) => x.id !== r.id)); await reload(); } catch (e) { showToast(e.message); } }}>Confirm & move</button>
                  <button className="btn-danger" onClick={async () => { await api.rejectSeatChange(r.id); setSeatChanges(seatChanges.filter((x) => x.id !== r.id)); }}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {vacatesOpen && (
        <Modal onClose={() => setVacatesOpen(false)}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, marginBottom: 4 }}>Vacate requests — {hall?.name}</div>
          {vacates.length === 0 && <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>No pending requests.</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {vacates.map((r) => (
              <div key={r.id} className="card">
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15 }}>{r.name} — Seat {r.seat_number}</div>
                <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 8 }}>{r.refund_eligible ? `Eligible for ₹${r.refund_amount} refund` : "Notified late — refund not guaranteed"}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-secondary" onClick={async () => { await api.confirmVacate(r.id); setVacates(vacates.filter((x) => x.id !== r.id)); await reload(); showToast("Scheduled to vacate at month end"); }}>Confirm</button>
                  <button className="btn-danger" onClick={async () => { await api.rejectVacate(r.id); setVacates(vacates.filter((x) => x.id !== r.id)); }}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}

function ReportsView({ reports, hallName }) {
  if (!reports) return <div>Loading…</div>;
  return (
    <div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, marginBottom: 16 }}>Reports — {hallName}</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <Stat label="Today's collection" value={`₹${reports.todayCollection}`} />
        <Stat label="This month" value={`₹${reports.monthCollection}`} />
        <Stat label="Total fee due" value={`₹${reports.totalDue}`} accent />
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", color: "var(--brass-deep)", marginBottom: 6 }}>Fee paid — {reports.paidList.length}</div>
      <List rows={reports.paidList} />
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", color: "var(--rust-deep)", margin: "14px 0 6px" }}>Fee due — {reports.dueList.length}</div>
      <List rows={reports.dueList} />
    </div>
  );
}
function Stat({ label, value, accent }) {
  return (
    <div style={{ flex: 1, minWidth: 130, background: accent ? "rgba(181,83,60,0.1)" : "rgba(92,138,102,0.1)", borderRadius: 10, padding: "10px 12px" }}>
      <div style={{ fontSize: 10, textTransform: "uppercase", fontFamily: "var(--font-mono)", color: "var(--ink-soft)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 20 }}>{value}</div>
    </div>
  );
}
function List({ rows }) {
  return (
    <div style={{ maxHeight: 140, overflowY: "auto", border: "1px solid var(--line)", borderRadius: 8 }}>
      {rows.length === 0 && <div style={{ padding: 10, fontSize: 12.5, color: "var(--ink-soft)" }}>None.</div>}
      {rows.map((r, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 10px", fontSize: 12.5, borderBottom: "1px solid var(--line)" }}>
          <span>Seat {r.seat_number} — {r.name}</span><span>₹{r.fee_amount}</span>
        </div>
      ))}
    </div>
  );
}

function UpiSettingsModal({ slug, hall, onClose, onSaved }) {
  const [upiId, setUpiId] = useState(hall.upi_id || "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function save() {
    setErr(""); setBusy(true);
    try {
      await api.updateHallUpi(slug, upiId);
      onSaved();
    } catch (e) { setErr(e.message); }
    setBusy(false);
  }

  return (
    <Modal onClose={onClose}>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, marginBottom: 10 }}>UPI settings — {hall.name}</div>
      <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 14 }}>Students and admin will see a QR code generated from this UPI ID for every payment. Set it once here.</div>
      <Field label="UPI ID"><input className="field-input" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="yourhall@okaxis" /></Field>
      {err && <div className="err-box">{err}</div>}
      <button disabled={busy} className="btn-primary" onClick={save}>Save</button>
    </Modal>
  );
}

function AddStudentModal({ slug, seatNumber, onClose, onSaved, showToast }) {
  const [form, setForm] = useState({
    name: "", mobile: "", aadhar: "", dob: "", gender: "", photoUrl: "", aadharPhotoUrl: "",
    email: "", password: "", qualification: "", category: "", occupation: "",
    guardianName: "", guardianOccupation: "", guardianMobile: "", address: "", pincode: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const PASSWORD_RULES = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

  async function submit() {
    if (!form.name.trim()) { setErr("Name is required"); return; }
    if (!/^\d{10}$/.test(form.mobile)) { setErr("Mobile must be exactly 10 digits"); return; }
    if (form.aadhar && !/^\d{12}$/.test(form.aadhar)) { setErr("Aadhar must be exactly 12 digits"); return; }
    if (!PASSWORD_RULES.test(form.password)) { setErr("Password must be 8+ chars with uppercase, lowercase, a number, and a special character."); return; }
    if (form.password !== confirmPassword) { setErr("Passwords don't match."); return; }
    setErr(""); setBusy(true);
    try {
      await api.assignSeat(slug, seatNumber, { ...form, paymentMethod: "cash" });
      onSaved();
    } catch (e) { setErr(e.message); }
    setBusy(false);
  }

  return (
    <Modal onClose={onClose}>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, marginBottom: 16 }}>Add student — Seat {seatNumber}</div>
      <Field label="Photo"><PhotoUpload label="Take / upload photo" value={form.photoUrl} onChange={(url) => setForm((f) => ({ ...f, photoUrl: url }))} capture folder="profile-photos" /></Field>
      <Field label="Candidate name *"><input className="field-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></Field>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}><Field label="Date of birth"><input type="date" className="field-input" value={form.dob} onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))} /></Field></div>
        <div style={{ flex: 1 }}><Field label="Gender">
          <select className="field-input" value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}>
            <option value="">Select</option><option>Male</option><option>Female</option><option>Other</option>
          </select>
        </Field></div>
      </div>
      <Field label="Aadhar number"><input className="field-input" value={form.aadhar} onChange={(e) => setForm((f) => ({ ...f, aadhar: e.target.value.replace(/\D/g, "").slice(0, 12) }))} /></Field>
      <Field label="Aadhar card"><PhotoUpload label="Upload Aadhar card" value={form.aadharPhotoUrl} onChange={(url) => setForm((f) => ({ ...f, aadharPhotoUrl: url }))} folder="aadhar-cards" /></Field>
      <Field label="Educational qualification"><input className="field-input" value={form.qualification} onChange={(e) => setForm((f) => ({ ...f, qualification: e.target.value }))} /></Field>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}><Field label="Mobile number *"><input className="field-input" value={form.mobile} onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) }))} /></Field></div>
        <div style={{ flex: 1 }}><Field label="Category"><input className="field-input" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} /></Field></div>
      </div>
      <Field label="Occupation"><input className="field-input" value={form.occupation} onChange={(e) => setForm((f) => ({ ...f, occupation: e.target.value }))} /></Field>
      <Field label="Parent's / Guardian's name"><input className="field-input" value={form.guardianName} onChange={(e) => setForm((f) => ({ ...f, guardianName: e.target.value }))} /></Field>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}><Field label="Guardian's occupation"><input className="field-input" value={form.guardianOccupation} onChange={(e) => setForm((f) => ({ ...f, guardianOccupation: e.target.value }))} /></Field></div>
        <div style={{ flex: 1 }}><Field label="Guardian's mobile"><input className="field-input" value={form.guardianMobile} onChange={(e) => setForm((f) => ({ ...f, guardianMobile: e.target.value.replace(/\D/g, "").slice(0, 10) }))} /></Field></div>
      </div>
      <Field label="Address"><input className="field-input" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} /></Field>
      <Field label="Pin code"><input className="field-input" value={form.pincode} onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) }))} /></Field>
      <Field label="Email"><input type="email" className="field-input" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></Field>
      <Field label="Student login password"><input type="password" className="field-input" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} /></Field>
      <div style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: -8, marginBottom: 12 }}>8+ characters with uppercase, lowercase, a number, and a special character.</div>
      <Field label="Confirm password"><input type="password" className="field-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></Field>
      {err && <div className="err-box">{err}</div>}
      <button disabled={busy} onClick={submit} className="btn-primary">Add student</button>
    </Modal>
  );
}

function SeatDetailModal({ slug, seatNumber, detail, onClose, onChanged, onVacated, showToast }) {
  const { seat, student } = detail;
  const [renewOpen, setRenewOpen] = useState(false);
  const [months, setMonths] = useState(1);

  const expiry = student.expiry_date ? new Date(student.expiry_date) : null;
  const daysLeft = expiry ? Math.ceil((expiry - new Date()) / 86400000) : null;

  async function renew() {
    try {
      const res = await api.renewSeat(slug, seatNumber, { months, method: "cash" });
      showToast(`Renewed to ${res.newExpiry}${res.fine ? ` (₹${res.fine} late fine applied)` : ""}`);
      setRenewOpen(false);
      onChanged();
    } catch (e) { showToast(e.message); }
  }

  async function vacate() {
    if (!confirm("Vacate this seat immediately?")) return;
    await api.vacateSeatNow(slug, seatNumber);
    onVacated();
  }

  return (
    <Modal onClose={onClose}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        {student.photo_url ? (
          <img src={student.photo_url.startsWith("http") ? student.photo_url : `${BASE_URL}${student.photo_url}`} alt="" style={{ width: 46, height: 46, borderRadius: "50%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: 46, height: 46, borderRadius: "50%", background: "var(--brass)" }} />
        )}
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18 }}>Seat {seatNumber}</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-soft)" }}>{student.name}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", color: "var(--brass-deep)", marginBottom: 6 }}>Student login</div>
        <div style={{ fontSize: 12.5, fontFamily: "var(--font-mono)" }}>Mobile: <b>{student.mobile}</b></div>
      </div>

      <Field label="Mobile"><div>{student.mobile}</div></Field>
      <Field label="Aadhar"><div>{student.aadhar_number || "—"}</div></Field>
      <Field label="Fee amount"><div>₹{student.fee_amount} · {student.fee_paid ? "Paid" : "Due"}</div></Field>
      <Field label="Joined"><div>{student.join_date}</div></Field>
      {expiry && (
        <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: daysLeft < 0 ? "var(--rust-deep)" : "var(--sage-deep)", marginBottom: 12 }}>
          {daysLeft < 0 ? `Expired ${Math.abs(daysLeft)} days ago` : `${daysLeft} days remaining`}
        </div>
      )}

      {student.vacating && (
        <div className="card" style={{ borderColor: "var(--plum)", background: "rgba(123,94,167,0.1)", marginBottom: 12 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Scheduled to vacate</div>
          <div style={{ fontSize: 12, color: "var(--ink-soft)", marginBottom: 10 }}>Freeing on {student.vacate_effective_date}. {student.refund_eligible ? `₹${student.refund_amount} refund due.` : "No refund (notified late)."}</div>
          <button className="btn-danger" onClick={async () => { await api.finalizeVacate(student.id); onVacated(); }}>Finalize now — free this seat</button>
        </div>
      )}

      {renewOpen ? (
        <div className="card" style={{ background: "rgba(92,138,102,0.08)", marginBottom: 12 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, marginBottom: 8 }}>Renew seat</div>
          <Field label="Duration">
            <select className="field-input" value={months} onChange={(e) => setMonths(Number(e.target.value))}>
              <option value={1}>1 month</option><option value={3}>3 months</option><option value={6}>6 months</option><option value={12}>12 months</option>
            </select>
          </Field>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-secondary" onClick={renew}>Confirm renewal (cash)</button>
            <button className="btn-danger" onClick={() => setRenewOpen(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn-secondary" onClick={() => setRenewOpen(true)}>Renew seat</button>
          <button className="btn-danger" onClick={vacate}>Vacate seat</button>
        </div>
      )}
    </Modal>
  );
}
