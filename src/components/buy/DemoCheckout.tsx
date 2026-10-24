import { useEffect, useRef, useState } from "react";
import { CreditCard, Landmark, Smartphone, X } from "lucide-react";
import { formatINR } from "../../constants/shop";
import type { PaymentProof, PaymentSession } from "../../lib/types";

interface Props {
  session: PaymentSession;
  onSuccess: (proof: PaymentProof) => void;
  onFail: (message: string) => void;
  onClose: () => void;
}

const methods = [
  { id: "upi", label: "UPI", icon: Smartphone },
  { id: "card", label: "Card", icon: CreditCard },
  { id: "netbanking", label: "Net banking", icon: Landmark },
] as const;

/** Stand-in for Razorpay Checkout while the site runs in demo mode. No money moves. */
function DemoCheckout({ session, onSuccess, onFail, onClose }: Props): React.ReactElement {
  const [method, setMethod] = useState<(typeof methods)[number]["id"]>("upi");
  const [working, setWorking] = useState(false);
  const payRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    payRef.current?.focus();
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const pay = (): void => {
    setWorking(true);
    window.setTimeout(
      () =>
        onSuccess({
          razorpay_order_id: session.razorpayOrderId,
          razorpay_payment_id: "demo_pay_" + Math.random().toString(36).slice(2, 10),
          razorpay_signature: "demo",
        }),
      1100
    );
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-pay-title"
        className="pop-in w-full max-w-md rounded-3xl border border-white/15 bg-[#141416] p-6 shadow-2xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="demo-pay-title" className="font-display text-xl font-medium tracking-tight">
              Demo checkout
            </h2>
            <p className="mt-1 text-sm text-gray-100">Test payment only. No money is charged.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 hover:bg-white/10">
            <X size={20} />
          </button>
        </div>

        <p className="mt-6 text-sm text-gray">Order {session.orderId}</p>
        <p className="font-display text-4xl font-semibold tracking-tight">{formatINR(session.amountPaise)}</p>

        <div className="mt-6 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Payment method">
          {methods.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={method === id}
              onClick={() => setMethod(id)}
              className={`flex flex-col items-center gap-2 rounded-2xl border px-2 py-4 text-sm transition ${
                method === id ? "border-cap bg-cap/10 text-white" : "border-white/15 text-gray-100 hover:border-white/40"
              }`}
            >
              <Icon size={20} aria-hidden />
              {label}
            </button>
          ))}
        </div>

        <button ref={payRef} type="button" className="btn mt-6 w-full disabled:opacity-60" onClick={pay} disabled={working}>
          {working ? "Processing…" : `Pay ${formatINR(session.amountPaise)}`}
        </button>
        <button
          type="button"
          className="mt-3 w-full text-center text-sm text-gray-100 underline-offset-4 hover:underline"
          onClick={() => onFail("The test payment was declined.")}
          disabled={working}
        >
          Simulate a failed payment
        </button>
      </div>
    </div>
  );
}

export default DemoCheckout;
