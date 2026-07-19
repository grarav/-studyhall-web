import { useState } from "react";

function upiQrUrl(upiId, payeeName, amount, note) {
  const upiStr = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiStr)}`;
}

// props: upiId, amount, payeeName, note (usually "Seat 47 - Ramesh Kumar"), onConfirmed
export function UpiQrPayment({ upiId, amount, payeeName, note, onConfirmed }) {
  const [confirmed, setConfirmed] = useState(false);

  if (!upiId) {
    return <div className="err-box">This hall hasn't set up a UPI ID yet — contact the admin to pay another way.</div>;
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
        <img src={upiQrUrl(upiId, payeeName || "Study Hall", amount, note || "")} alt="UPI QR code" style={{ width: 200, height: 200, borderRadius: 8 }} />
      </div>
      <div style={{ fontSize: 12.5, color: "var(--ink-soft)", textAlign: "center", marginBottom: 14 }}>
        Scan with GPay, PhonePe, or any UPI app to pay <b>₹{amount}</b>. The payment note will show "{note}" so the admin knows it's you.
      </div>
      <button
        className="btn-secondary"
        style={{ width: "100%" }}
        disabled={confirmed}
        onClick={() => { setConfirmed(true); onConfirmed(); }}
      >
        {confirmed ? "Sent for confirmation…" : "I've paid via UPI"}
      </button>
    </div>
  );
}
