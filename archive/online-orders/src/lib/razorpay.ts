import type { PaymentProof } from "./types";

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  handler: (response: PaymentProof) => void;
  modal: { ondismiss: () => void };
}
interface RazorpayInstance {
  open(): void;
  on(event: "payment.failed", cb: (r: { error: { description: string } }) => void): void;
}
declare global {
  interface Window {
    Razorpay?: new (o: RazorpayOptions) => RazorpayInstance;
  }
}

let loader: Promise<void> | null = null;
function loadScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  loader ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve();
    s.onerror = () => {
      loader = null;
      reject(new Error("Could not load the payment window. Check your connection and try again."));
    };
    document.head.appendChild(s);
  });
  return loader;
}

export class PaymentDismissed extends Error {
  constructor() {
    super("Payment window closed before paying.");
  }
}

/** Opens Razorpay Checkout (UPI, cards, net banking, wallets). Resolves with the proof to verify on the server. */
export async function openRazorpay(args: {
  keyId: string;
  razorpayOrderId: string;
  amountPaise: number;
  description: string;
  prefill: { name: string; email: string; contact: string };
}): Promise<PaymentProof> {
  await loadScript();
  const Rzp = window.Razorpay;
  if (!Rzp) throw new Error("Payment window is unavailable.");
  return new Promise<PaymentProof>((resolve, reject) => {
    const rzp = new Rzp({
      key: args.keyId,
      amount: args.amountPaise,
      currency: "INR",
      name: "JUNO.1",
      description: args.description,
      order_id: args.razorpayOrderId,
      prefill: args.prefill,
      theme: { color: "#E8DFA0" },
      handler: resolve,
      modal: { ondismiss: () => reject(new PaymentDismissed()) },
    });
    rzp.on("payment.failed", (r) => reject(new Error(r.error.description || "Payment failed.")));
    rzp.open();
  });
}
