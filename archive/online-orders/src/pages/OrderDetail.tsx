import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import AuthPanel from "../components/buy/AuthPanel";
import StatusChip from "../components/buy/StatusChip";
import { TIMELINE, formatINR } from "../constants/shop";
import { SITE, whatsappLink } from "../constants/site";
import { useAuth } from "../context/AuthContext";
import { useCheckout } from "../hooks/useCheckout";
import { usePageTitle } from "../hooks/usePageTitle";
import { api } from "../lib/api";
import { demoAdvance } from "../lib/demoApi";
import { formatDate } from "../lib/format";
import { PaymentDismissed } from "../lib/razorpay";
import type { Order } from "../lib/types";

const stamp = (iso: string | null | undefined): string =>
  iso
    ? new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })
    : "";

/** Animated tick shown right after a successful payment. */
function PaidTick(): React.ReactElement {
  return (
    <div className="relative flex h-20 w-20 items-center justify-center" aria-hidden>
      <span className="absolute inset-0 rounded-full border border-cap" style={{ animation: "ring-out 1.4s ease-out 0.5s both" }} />
      <svg viewBox="0 0 52 52" className="h-20 w-20 text-cap" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="26" cy="26" r="23" strokeDasharray="145" strokeDashoffset="145" style={{ animation: "draw-check 0.9s ease-out forwards" }} />
        <path d="M15 27l8 8 14-16" strokeDasharray="36" strokeDashoffset="36" style={{ animation: "draw-check 0.6s ease-out 0.7s forwards" }} />
      </svg>
    </div>
  );
}

function OrderDetail(): React.ReactElement {
  const { id = "" } = useParams();
  usePageTitle(`Order ${id}`);
  const [params] = useSearchParams();
  const { user, loading } = useAuth();
  const checkout = useCheckout();
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const [error, setError] = useState("");
  const [payBusy, setPayBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    api
      .getOrder(id)
      .then((o) => alive && setOrder(o))
      .catch((e: unknown) => alive && setError(e instanceof Error ? e.message : "Could not load this order."));
    return () => {
      alive = false;
    };
  }, [user, id]);

  const payNow = async (o: Order): Promise<void> => {
    if (!o.razorpayOrderId) return;
    setPayBusy(true);
    setError("");
    try {
      const paid = await checkout.pay(
        {
          orderId: o.id,
          amountPaise: o.totalPaise,
          razorpayOrderId: o.razorpayOrderId,
          keyId: api.mode === "live" ? (import.meta.env.VITE_RAZORPAY_KEY_ID ?? "") : "demo",
        },
        { name: o.customer.name, email: o.customer.email, contact: o.customer.phone }
      );
      setOrder(paid);
    } catch (e) {
      if (!(e instanceof PaymentDismissed)) setError(e instanceof Error ? e.message : "Payment failed.");
    } finally {
      setPayBusy(false);
    }
  };

  if (loading) return <section className="min-h-[50vh]" />;

  if (!user) {
    return (
      <section className="px-5 pb-24 pt-16 sm:px-10 sm:pt-24">
        <div className="screen-max-width max-w-xl">
          <h1 className="page-title" data-split>Track order</h1>
          <div className="mt-10" data-reveal="scale">
            <AuthPanel intro={`Sign in to see order ${id}.`} />
          </div>
        </div>
      </section>
    );
  }

  if (order === undefined && !error) return <section className="min-h-[50vh] px-5 pt-24 sm:px-10"><p className="screen-max-width text-gray-100">Loading order…</p></section>;

  if (!order) {
    return (
      <section className="px-5 pb-24 pt-16 sm:px-10 sm:pt-24">
        <div className="screen-max-width">
          <h1 className="page-title" data-split>Order not found</h1>
          <p className="prose-juno mt-6">{error || `We couldn't find order ${id} on your account. Check the ID, or sign in with the email you ordered with.`}</p>
          <Link to="/orders" className="btn mt-8">See my orders</Link>
        </div>
      </section>
    );
  }

  const times: Record<string, string | null> = {
    placed: order.createdAt,
    paid: order.paidAt,
    packed: order.packedAt,
    shipped: order.shippedAt,
    delivered: order.deliveredAt,
  };
  const lastDone = TIMELINE.reduce((acc, s, i) => (times[s.key] ? i : acc), 0);
  const justPaid = params.get("paid") === "1" && order.status !== "pending_payment";
  const c = order.customer;
  const closed = order.status === "cancelled" || order.status === "payment_failed";

  return (
    <section className="px-5 pb-24 pt-16 sm:px-10 sm:pt-24">
      <div className="screen-max-width">
        <Link to="/orders" className="text-gray-100 underline-offset-4 hover:text-white hover:underline" data-reveal="fade">
          ← All orders
        </Link>

        {justPaid && (
          <div className="mt-8 flex items-center gap-6" data-reveal>
            <PaidTick />
            <div>
              <p className="font-display text-2xl font-medium tracking-tight">Payment received. Thank you.</p>
              <p className="mt-1 text-gray-100">A confirmation will be sent to {c.email}.</p>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-gray">Order ID</p>
            <h1 className="page-title mt-1 break-all" data-split>{order.id}</h1>
          </div>
          <StatusChip status={order.status} />
        </div>
        <p className="mt-4 text-gray-100">Placed {formatDate(order.createdAt)}. Keep this ID to track your JUNO.1.</p>

        {error && <p role="alert" className="mt-6 text-red-300">{error}</p>}

        {order.status === "pending_payment" && (
          <div className="mt-8 flex flex-wrap items-center gap-4 rounded-3xl border border-amber-300/40 bg-amber-300/10 p-6" data-reveal>
            <p className="max-w-[46ch] text-amber-100">This order is saved but not paid yet. Pay to confirm it.</p>
            <button type="button" className="btn disabled:opacity-60" onClick={() => void payNow(order)} disabled={payBusy}>
              Pay {formatINR(order.totalPaise)}
            </button>
          </div>
        )}

        <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
          {/* Tracking */}
          <div>
            <h2 className="section-heading" data-split>Tracking</h2>
            {closed ? (
              <p className="prose-juno mt-6" data-reveal>
                This order is {order.status === "cancelled" ? "cancelled" : "not paid"}. Contact support if that
                looks wrong.
              </p>
            ) : (
              <ol className="mt-8" data-stagger>
                {TIMELINE.map((s, i) => {
                  const done = Boolean(times[s.key]);
                  const current = i === lastDone;
                  return (
                    <li key={s.key} className="relative grid grid-cols-[2rem_1fr] gap-4 pb-9 last:pb-0">
                      {i < TIMELINE.length - 1 && (
                        <span
                          aria-hidden
                          className={`absolute left-[0.9rem] top-8 h-[calc(100%-2rem)] w-px ${i < lastDone ? "bg-cap" : "bg-white/15"}`}
                        />
                      )}
                      <span
                        aria-hidden
                        className={`relative mt-1 flex h-7 w-7 items-center justify-center rounded-full border ${
                          done ? "border-cap bg-cap" : "border-white/25"
                        }`}
                      >
                        {current && done && <span className="absolute inset-0 rounded-full bg-cap" style={{ animation: "ring-out 2s ease-out infinite" }} />}
                      </span>
                      <div>
                        <p className={`text-lg font-medium ${done ? "text-white" : "text-gray"}`}>{s.label}</p>
                        <p className="text-gray-100">{done ? stamp(times[s.key]) : s.hint}</p>
                        {s.key === "shipped" && done && order.trackingNumber && (
                          <p className="mt-1 text-gray-100">
                            {order.courier ?? "Courier"} tracking number:{" "}
                            <span className="select-all text-white">{order.trackingNumber}</span>
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}

            {api.mode === "demo" && order.status !== "delivered" && order.status !== "pending_payment" && !closed && (
              <button
                type="button"
                className="btn-ghost mt-10 !py-2.5 text-sm"
                onClick={() => {
                  demoAdvance(order.id);
                  void api.getOrder(order.id).then((o) => setOrder(o));
                }}
              >
                Demo: move to next stage
              </button>
            )}
          </div>

          {/* Summary */}
          <div className="space-y-8">
            <div className="rounded-3xl border border-line bg-surface p-6 sm:p-8" data-reveal="scale">
              <h2 className="font-display text-xl font-medium tracking-tight">Order summary</h2>
              <dl className="mt-5 space-y-3 text-gray-100">
                <div className="flex justify-between"><dt>{order.quantity} × JUNO.1</dt><dd>{formatINR(order.unitPricePaise * order.quantity)}</dd></div>
                <div className="flex justify-between"><dt>Shipping</dt><dd>{order.shippingPaise === 0 ? "Free" : formatINR(order.shippingPaise)}</dd></div>
                <div className="flex items-baseline justify-between border-t border-line pt-4 text-white"><dt>Total</dt><dd className="font-display text-2xl font-semibold">{formatINR(order.totalPaise)}</dd></div>
              </dl>
              {order.razorpayPaymentId && (
                <p className="mt-5 break-all text-sm text-gray">Payment reference: {order.razorpayPaymentId}</p>
              )}
            </div>

            <div className="rounded-3xl border border-line bg-surface p-6 sm:p-8" data-reveal="scale">
              <h2 className="font-display text-xl font-medium tracking-tight">Delivering to</h2>
              <address className="mt-5 not-italic leading-relaxed text-gray-100">
                <span className="text-white">{c.name}</span><br />
                {c.line1}<br />
                {c.line2 && <>{c.line2}<br /></>}
                {c.city}, {c.state} {c.pincode}<br />
                {c.phone}
              </address>
              {order.notes && <p className="mt-4 text-gray-100">Note: {order.notes}</p>}
            </div>

            <a
              href={whatsappLink(`Hi, I have a question about my JUNO.1 order ${order.id}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost w-full sm:w-auto"
              data-reveal
            >
              Ask about this order on WhatsApp
              <ArrowUpRight size={18} aria-hidden />
            </a>
            <p className="text-sm text-gray" data-reveal="fade">Or email {SITE.email} with your order ID.</p>
          </div>
        </div>
      </div>
      {checkout.modal}
    </section>
  );
}

export default OrderDetail;
