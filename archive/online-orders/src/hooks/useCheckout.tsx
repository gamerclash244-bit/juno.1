import { useCallback, useState } from "react";
import DemoCheckout from "../components/buy/DemoCheckout";
import { api } from "../lib/api";
import { PaymentDismissed, openRazorpay } from "../lib/razorpay";
import type { Order, PaymentProof, PaymentSession } from "../lib/types";

interface Pending {
  session: PaymentSession;
  resolve: (p: PaymentProof) => void;
  reject: (e: Error) => void;
}

interface Prefill {
  name: string;
  email: string;
  contact: string;
}

/**
 * Opens the payment window (Razorpay when live, a demo sheet otherwise), then has the server
 * verify the payment. Resolves with the paid order; rejects with PaymentDismissed if closed.
 */
export function useCheckout(): { pay: (s: PaymentSession, prefill: Prefill) => Promise<Order>; modal: React.ReactNode } {
  const [pending, setPending] = useState<Pending | null>(null);

  const pay = useCallback(async (session: PaymentSession, prefill: Prefill): Promise<Order> => {
    const proof =
      api.mode === "live"
        ? await openRazorpay({
            keyId: session.keyId,
            razorpayOrderId: session.razorpayOrderId,
            amountPaise: session.amountPaise,
            description: `JUNO.1 order ${session.orderId}`,
            prefill,
          })
        : await new Promise<PaymentProof>((resolve, reject) => setPending({ session, resolve, reject }));
    return api.verifyPayment(proof);
  }, []);

  const modal = pending ? (
    <DemoCheckout
      session={pending.session}
      onSuccess={(p) => {
        pending.resolve(p);
        setPending(null);
      }}
      onFail={(m) => {
        pending.reject(new Error(m));
        setPending(null);
      }}
      onClose={() => {
        pending.reject(new PaymentDismissed());
        setPending(null);
      }}
    />
  ) : null;

  return { pay, modal };
}
