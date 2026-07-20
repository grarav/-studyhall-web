import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api, clearToken } from "../lib/api";
import { UpiQrPayment } from "../components/UpiQrPayment";

export default function StudentPortal() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [renewOpen, setRenewOpen] = useState(false);
  const [months, setMonths] = useState(1);
  const [changeOpen, setChangeOpen] = useState(false);
  const [vacantSeats, setVacantSeats] = useState([]);
  const nav = useNavigate();

  const load = useCallback(async () => {
    try { setMe(await api.studentMe()); }
    catch (e) { clearToken("student"); nav("/student/login"); }
    setLoading(false);
  }, [nav]);
  useEffect(() => { load(); }, [load]);

  function logout() { clearToken("student"); nav("/"); }

  if (loading || !me) return <div style={{ padding: 40 }}>Loading…</div>;

  const expiry = me.expiry_date ? new Date(me.expiry_date) : null;
  const daysLeft = expiry ? Math.ceil((expiry - new Date()) / 86400000) : null;

  return (
    <div style={{ minHeight: "100vh" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 26 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--brass-deep)" }}>Student portal</div>
          <button onClick={logout} className="link-btn">Log out</button>
        </div>

        <div style={{ background: "var(--ink)", color: "var(--parchment)", borderRadius: 14, padding: 22, marginBottom: 20 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 22 }}>{me.name}</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--brass)", marginTop: 6 }}>{me.hall_name} · Seat {me.seat_number}</div>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 14, color: me.fee_paid ? "var(--sage-deep)" : "var(--rust-deep)", fontWeight: 600, marginBottom: 6 }}>{me.fee_paid ? "Fee paid" : "Fee due"}</div>
          <div style={{ fontSize: 14, marginBottom: 4 }}>Valid until: {me.expiry_date || "—"}</div>
          {expiry && (
            <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: daysLeft < 0 ? "var(--rust-deep)" : "var(--sage-deep)" }}>
              {daysLeft < 0 ? `Expired ${Math.abs(daysLeft)} days ago` : `${daysLeft} days remaining`}
            </div>
          )}
        </div>

        {me.vacating ? (
          <div className="card" style={{ borderColor: "var(--plum)", background: "rgba(123,94,167,0.1)", marginBottom: 12 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, marginBottom: 6 }}>Seat scheduled to be vacated</div>
            <div style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>
              Freeing on {me.vacate_effective_date}. {me.refund_eligible ? `Your ₹${me.refund_amount} refund is due from your admin.` : "No refund (notified late)."}
            </div>
          </div>
        ) : (
          <>
            {!renewOpen && !changeOpen && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button onClick={() => setRenewOpen(true)} className="btn-secondary">Renew my seat</button>
                <button
                  onClick={async () => { setVacantSeats(await api.vacantSeats(me.hall_slug || "").catch(() => [])); setChangeOpen(true); }}
                  style={{ background: "var(--parchment-deep)", border: "1px solid var(--line)", borderRadius: 8, padding: "10px 16px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
                >
                  Change my seat
                </button>
                <button
                  onClick={async () => {
                    if (!confirm("Request to vacate your seat? Your admin will confirm and your seat will free up at month end.")) return;
                    await api.requestVacate();
                    load();
                    alert("Vacate request sent to your admin.");
                  }}
                  className="btn-danger"
                >
                  Vacate my seat
                </button>
              </div>
            )}

            {renewOpen && <RenewPanel me={me} months={months} setMonths={setMonths} onClose={() => setRenewOpen(false)} onDone={() => { setRenewOpen(false); load(); }} />}

            {changeOpen && (
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Choose a vacant seat (₹100 fee)</div>
                <SeatChangePicker hallSlug={me.hall_slug} vacantSeats={vacantSeats} upiId={me.upi_id} hallName={me.hall_name} studentName={me.name} onDone={() => { setChangeOpen(false); load(); }} />
                <button onClick={() => setChangeOpen(false)} className="link-btn" style={{ marginTop: 10 }}>Cancel</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function RenewPanel({ me, months, setMonths, onClose, onDone }) {
  const day = new Date().getDate();
  const fine = day > 5 ? (day - 5) * 25 : 0;
  const baseFee = Number(me.fee_amount) || 0; // approximation shown to the student before payment
  const amount = baseFee * months + fine;

  return (
    <div className="card" style={{ background: "rgba(92,138,102,0.08)" }}>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, marginBottom: 8 }}>Renew seat {me.seat_number}</div>
      <select className="field-input" value={months} onChange={(e) => setMonths(Number(e.target.value))} style={{ marginBottom: 10 }}>
        <option value={1}>1 month</option><option value={3}>3 months</option><option value={6}>6 months</option><option value={12}>12 months</option>
      </select>
      <div style={{ fontSize: 11.5, color: "var(--ink-soft)", marginBottom: 10 }}>
        ₹{baseFee}/month × {months}{fine > 0 ? ` + ₹${fine} late fine (after the 5th, ₹25/day)` : ""} = <b>₹{amount}</b>
      </div>
      <UpiQrPayment
        upiId={me.upi_id} amount={amount} payeeName={me.hall_name}
        note={`Renewal Seat ${me.seat_number} - ${me.name}`}
        onConfirmed={() => { alert("Payment received — your admin will confirm shortly."); onDone(); }}
      />
      <button onClick={onClose} className="link-btn" style={{ marginTop: 10 }}>Cancel</button>
    </div>
  );
}

function SeatChangePicker({ hallSlug, vacantSeats, upiId, hallName, studentName, onDone }) {
  const [selected, setSelected] = useState(null);

  if (selected) {
    return (
      <UpiQrPayment
        upiId={upiId} amount={100} payeeName={hallName}
        note={`Seat Change to ${selected} - ${studentName}`}
        onConfirmed={async () => { await api.requestSeatChange({ toSeatNumber: selected }); alert("Sent to your admin for confirmation."); onDone(); }}
      />
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, maxHeight: 320, overflowY: "auto" }}>
      {vacantSeats.map((s) => (
        <button
          key={s.seat_number}
          onClick={() => setSelected(s.seat_number)}
          style={{ background: "var(--parchment-deep)", border: "1px solid var(--line)", borderRadius: 8, padding: "14px 0", fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600, cursor: "pointer", color: "var(--ink)" }}
        >
          {s.seat_number}
        </button>
      ))}
    </div>
  );
}
