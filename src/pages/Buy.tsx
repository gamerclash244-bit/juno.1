import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, Lock, Minus, Plus, ShieldCheck } from "lucide-react";
import AuthPanel from "../components/buy/AuthPanel";
import Field from "../components/buy/Field";
import Wordmark from "../components/Wordmark";
import { INDIAN_STATES, PRODUCT, formatINR } from "../constants/shop";
import { useAuth } from "../context/AuthContext";
import { useCheckout } from "../hooks/useCheckout";
import { usePageTitle } from "../hooks/usePageTitle";
import { api } from "../lib/api";
import { PaymentDismissed } from "../lib/razorpay";
import type { Customer, PaymentSession } from "../lib/types";
import { emptyCustomer, validateCustomer } from "../lib/validate";
import type { Errors } from "../lib/validate";

const DRAFT_KEY = "juno-buy-draft";

interface Draft {
  customer: Customer;
  notes: string;
  quantity: number;
}

const loadDraft = (): Draft => {
  try {
    const d = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "") as Draft;
    return { customer: { ...emptyCustomer, ...d.customer }, notes: d.notes ?? "", quantity: d.quantity || 1 };
  } catch {
    return { customer: emptyCustomer, notes: "", quantity: 1 };
  }
};

/** Buy page: sign in, enter delivery details, review the order, pay online. */
function Buy(): React.ReactElement {
  usePageTitle("Buy");
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const checkout = useCheckout();

  const [draft] = useState(loadDraft);
  const [customer, setCustomer] = useState<Customer>(draft.customer);
  const [notes, setNotes] = useState(draft.notes);
  const [quantity, setQuantity] = useState(draft.quantity);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [payError, setPayError] = useState("");

  // Reuse the same server order when the buyer retries without changing anything.
  const session = useRef<{ key: string; value: PaymentSession } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Fill in name and email from the account once.
  useEffect(() => {
    if (!user) return;
    setCustomer((c) => ({ ...c, name: c.name || user.name || "", email: c.email || user.email }));
  }, [user]);

  // Keep the form across reloads.
  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ customer, notes, quantity }));
  }, [customer, notes, quantity]);

  const subtotal = PRODUCT.pricePaise * quantity;
  const total = subtotal + PRODUCT.shippingPaise;
  const detailsOk = useMemo(() => Object.keys(validateCustomer(customer)).length === 0, [customer]);

  const set = (k: keyof Customer) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    setCustomer((c) => ({ ...c, [k]: e.target.value }));
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }));
  };

  const submit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setPayError("");
    const errs = validateCustomer(customer);
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`#f-${first}`)?.focus();
      return;
    }

    setBusy(true);
    try {
      const key = JSON.stringify({ quantity, customer, notes });
      if (session.current?.key !== key) {
        const value = await api.createOrder({ quantity, customer, notes, expectedTotalPaise: total });
        session.current = { key, value };
      }
      const order = await checkout.pay(session.current.value, {
        name: customer.name,
        email: customer.email,
        contact: customer.phone,
      });
      localStorage.removeItem(DRAFT_KEY);
      navigate(`/orders/${order.id}?paid=1`);
    } catch (err) {
      if (err instanceof PaymentDismissed && session.current) {
        setPayError(
          `Payment wasn't completed. Your order ${session.current.value.orderId} is saved. Press Pay again when you're ready.`
        );
      } else {
        setPayError(err instanceof Error ? err.message : "Something went wrong. Try again.");
      }
    } finally {
      setBusy(false);
    }
  };

  const steps = [
    { label: "Sign in", done: Boolean(user) },
    { label: "Delivery", done: Boolean(user) && detailsOk },
    { label: "Pay", done: false },
  ];

  return (
    <section className="px-5 pb-24 pt-16 sm:px-10 sm:pt-24">
      <div className="screen-max-width">
        <h1 className="page-title" data-split>Buy JUNO.1</h1>
        <p className="prose-juno mt-8 text-xl" data-reveal>
          Sign in, tell us where to send it, and pay online. Every order gets an order ID you can use to track it.
        </p>

        {api.mode === "demo" && (
          <p className="mt-8 max-w-[62ch] rounded-2xl border border-cap/40 bg-cap/10 px-5 py-4 text-cap" data-reveal>
            Demo mode: accounts and orders stay on this device and the payment window is a test. Connect the backend
            (see README) to take real payments.
          </p>
        )}

        <ol className="mt-12 flex flex-wrap items-center gap-x-3 gap-y-2" aria-label="Checkout steps" data-stagger>
          {steps.map((s, i) => (
            <li key={s.label} className="flex items-center gap-3">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold transition-colors duration-500 ${
                  s.done ? "border-cap bg-cap text-black" : "border-white/25 text-white"
                }`}
              >
                {s.done ? <Check size={16} aria-label="Done" /> : i + 1}
              </span>
              <span className={s.done ? "text-white" : "text-gray-100"}>{s.label}</span>
              {i < steps.length - 1 && <span className="mx-1 h-px w-8 bg-white/20 sm:w-14" aria-hidden />}
            </li>
          ))}
        </ol>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.45fr_1fr] lg:items-start">
          <div className="space-y-8">
            {/* 1. Account */}
            <div data-reveal="scale">
              {loading ? (
                <div className="h-40 rounded-3xl border border-line bg-surface" aria-hidden />
              ) : user ? (
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-line bg-surface p-6 sm:p-8">
                  <div>
                    <p className="text-sm text-gray">Signed in as</p>
                    <p className="mt-1 break-all text-lg">{user.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link to="/orders" className="btn-ghost !px-5 !py-2.5 text-sm">My orders</Link>
                    <button type="button" onClick={() => void signOut()} className="btn-ghost !px-5 !py-2.5 text-sm">
                      Sign out
                    </button>
                  </div>
                </div>
              ) : (
                <AuthPanel />
              )}
            </div>

            {/* 2. Delivery */}
            {user ? (
              <form
                id="buy-form"
                ref={formRef}
                onSubmit={submit}
                noValidate
                className="rounded-3xl border border-line bg-surface p-6 sm:p-9"
                data-reveal="scale"
              >
                <h2 className="font-display text-2xl font-medium tracking-tight">Delivery details</h2>
                <p className="mt-2 text-gray-100">We ship across India. Use the address where someone can receive it.</p>

                <div className="mt-8 grid gap-5 sm:grid-cols-2">
                  <Field id="f-name" label="Full name" error={errors.name}>
                    {(p) => <input {...p} autoComplete="name" value={customer.name} onChange={set("name")} />}
                  </Field>
                  <Field id="f-phone" label="Mobile number" error={errors.phone} hint="For delivery updates.">
                    {(p) => <input {...p} type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="98765 43210" value={customer.phone} onChange={set("phone")} />}
                  </Field>
                  <div className="sm:col-span-2">
                    <Field id="f-email" label="Email" error={errors.email} hint="Your receipt and order updates go here.">
                      {(p) => <input {...p} type="email" autoComplete="email" value={customer.email} onChange={set("email")} />}
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field id="f-line1" label="Address" error={errors.line1}>
                      {(p) => <input {...p} autoComplete="address-line1" placeholder="House / flat no., street" value={customer.line1} onChange={set("line1")} />}
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field id="f-line2" label="Area or landmark (optional)">
                      {(p) => <input {...p} autoComplete="address-line2" value={customer.line2} onChange={set("line2")} />}
                    </Field>
                  </div>
                  <Field id="f-city" label="City or town" error={errors.city}>
                    {(p) => <input {...p} autoComplete="address-level2" value={customer.city} onChange={set("city")} />}
                  </Field>
                  <Field id="f-pincode" label="PIN code" error={errors.pincode}>
                    {(p) => <input {...p} inputMode="numeric" maxLength={6} autoComplete="postal-code" value={customer.pincode} onChange={set("pincode")} />}
                  </Field>
                  <div className="sm:col-span-2">
                    <Field id="f-state" label="State" error={errors.state}>
                      {(p) => (
                        <select {...p} autoComplete="address-level1" value={customer.state} onChange={set("state")}>
                          <option value="">Choose your state</option>
                          {INDIAN_STATES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      )}
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field id="f-notes" label="Order notes (optional)">
                      {(p) => (
                        <textarea
                          id={p.id}
                          className={p.className}
                          rows={3}
                          maxLength={300}
                          placeholder="Anything we should know about delivery?"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        />
                      )}
                    </Field>
                  </div>
                </div>
              </form>
            ) : (
              <div className="flex items-center gap-4 rounded-3xl border border-dashed border-white/20 p-6 text-gray-100 sm:p-8" data-reveal>
                <Lock size={20} aria-hidden className="shrink-0" />
                <p>Delivery details appear once you are signed in.</p>
              </div>
            )}
          </div>

          {/* 3. Order summary + pay */}
          <aside className="lg:sticky lg:top-28" aria-label="Order summary" data-reveal="scale">
            <div className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-medium tracking-tight">Your order</h2>
                <Wordmark className="text-xl" />
              </div>

              <ul className="mt-5 space-y-2 border-b border-line pb-6 text-gray-100">
                {PRODUCT.includes.map((i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check size={16} className="mt-1.5 shrink-0 text-cap" aria-hidden />
                    {i}
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between border-b border-line py-5">
                <span id="qty-label">Quantity</span>
                <div className="flex items-center gap-3" role="group" aria-labelledby="qty-label">
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 transition hover:border-white disabled:opacity-40"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-6 text-center font-display text-lg" aria-live="polite">{quantity}</span>
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 transition hover:border-white disabled:opacity-40"
                    onClick={() => setQuantity((q) => Math.min(PRODUCT.maxQty, q + 1))}
                    disabled={quantity >= PRODUCT.maxQty}
                    aria-label="Increase quantity"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <dl className="space-y-3 py-5 text-gray-100">
                <div className="flex justify-between">
                  <dt>{quantity} × {PRODUCT.name}</dt>
                  <dd>{formatINR(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Shipping</dt>
                  <dd>{PRODUCT.shippingPaise === 0 ? "Free" : formatINR(PRODUCT.shippingPaise)}</dd>
                </div>
                <div className="flex items-baseline justify-between border-t border-line pt-4 text-white">
                  <dt className="text-lg">Total</dt>
                  <dd className="font-display text-3xl font-semibold tracking-tight">{formatINR(total)}</dd>
                </div>
              </dl>

              {payError && (
                <p role="alert" className="mb-4 rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-red-200">
                  {payError}
                </p>
              )}

              <button
                type="submit"
                form="buy-form"
                className="btn w-full disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!user || busy}
              >
                {busy ? "Opening payment…" : user ? `Pay ${formatINR(total)}` : "Sign in to pay"}
              </button>
              <p className="mt-4 flex items-start gap-2 text-sm text-gray">
                <ShieldCheck size={16} className="mt-0.5 shrink-0" aria-hidden />
                Pay online by UPI, card or net banking. Your payment details never touch this site.
              </p>
            </div>
          </aside>
        </div>
      </div>
      {checkout.modal}
    </section>
  );
}

export default Buy;
