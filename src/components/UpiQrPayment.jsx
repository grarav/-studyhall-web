import { useState } from "react";

function upiDeepLink(upiId, payeeName, amount, note) {
  return `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
}
function upiQrUrl(upiId, payeeName, amount, note) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiDeepLink(upiId, payeeName, amount, note))}`;
}

const isMobile = typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// props: upiId, amount, payeeName, note (usually "Seat 47 - Ramesh Kumar"), onConfirmed
export function UpiQrPayment({ upiId, amount, payeeName, note, onConfirmed }) {
  const [confirmed, setConfirmed] = useState(false);

  if (!upiId) {
    return <div className="err-box">This hall hasn't set up a UPI ID yet — contact the admin to pay another way.</div>;
  }

  const link = upiDeepLink(upiId, payeeName || "Study Hall", amount, note || "");

  return (
    <div>
      {isMobile && (
        <a
          href={link}
          style={{ display: "block", textAlign: "center", background: "var(--ink)", color: "var(--parchment)", borderRadius: 8, padding: "12px 16px", fontWeight: 600, fontSize: 14, textDecoration: "none", marginBottom: 14 }}
        >
          Pay ₹{amount} now in GPay / PhonePe / any UPI app
        </a>
      )}

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
        <img src={upiQrUrl(upiId, payeeName || "Study Hall", amount, note || "")} alt="UPI QR code" style={{ width: 200, height: 200, borderRadius: 8 }} />
      </div>
      <div style={{ fontSize: 12.5, color: "var(--ink-soft)", textAlign: "center", marginBottom: 14 }}>
        {isMobile ? "Or scan this with another device." : "Scan with GPay, PhonePe, or any UPI app"} to pay <b>₹{amount}</b>. The payment note will show "{note}" so the admin knows it's you.
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
