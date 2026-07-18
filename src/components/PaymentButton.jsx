import { useState } from "react";
import { api } from "../lib/api";
import { payWithRazorpay } from "../lib/razorpay";

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || "";

// props: amount, hallId, studentId?, seatNumber?, type, label, prefillName, prefillContact, onPaid(orderId)
export function PaymentButton({ amount, hallId, studentId, seatNumber, type, label, prefillName, prefillContact, onPaid }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function pay() {
    setErr(""); setBusy(true);
    try {
      const { order } = await api.createOrder({ amount, hallId, studentId, seatNumber, type });
      if (!RAZORPAY_KEY_ID) throw new Error("Payment gateway key is not configured on the frontend (VITE_RAZORPAY_KEY_ID).");
      const result = await payWithRazorpay({
        order, keyId: RAZORPAY_KEY_ID, name: "Study Hall", description: type,
        prefill: { name: prefillName, contact: prefillContact },
      });
      await api.verifyPayment(result);
      onPaid(order.id, result);
    } catch (e) {
      setErr(e.message || "Payment failed");
    }
    setBusy(false);
  }

  return (
    <div>
      {err && <div className="err-box">{err}</div>}
      <button disabled={busy} onClick={pay} className="btn-secondary" style={{ width: "100%" }}>
        {busy ? "Opening payment…" : label || `Pay ₹${amount}`}
      </button>
      {!RAZORPAY_KEY_ID && (
        <div style={{ fontSize: 11.5, color: "var(--rust-deep)", marginTop: 8 }}>
          Payment gateway isn't configured yet — set RAZORPAY_KEY_ID/SECRET on the backend and VITE_RAZORPAY_KEY_ID on the frontend to enable real payments.
        </div>
      )}
    </div>
  );
}
