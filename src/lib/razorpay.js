// Loads Razorpay's Checkout script once and opens the payment modal.
// Resolves with { paymentId, orderId, signature } on success.

let scriptPromise = null;
function loadScript() {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Couldn't load the payment gateway. Check your connection."));
    document.body.appendChild(script);
  });
  return scriptPromise;
}

export async function payWithRazorpay({ order, keyId, name, description, prefill }) {
  await loadScript();
  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: keyId,
      amount: order.amount,
      currency: order.currency,
      order_id: order.id,
      name: name || "Study Hall",
      description: description || "",
      prefill: prefill || {},
      theme: { color: "#1B2430" },
      handler: (response) => {
        resolve({
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          signature: response.razorpay_signature,
        });
      },
      modal: {
        ondismiss: () => reject(new Error("Payment cancelled")),
      },
    });
    rzp.open();
  });
}
