import { createClient } from "@supabase/supabase-js";
import type { Session, User as SbUser } from "@supabase/supabase-js";
import type { OrderStatus } from "../constants/shop";
import type { Api, Order, OrderInput, PaymentProof, PaymentSession, User } from "./types";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isLive = Boolean(url && anon);

const sb = isLive ? createClient(url as string, anon as string) : null;
const client = () => {
  if (!sb) throw new Error("Backend is not configured.");
  return sb;
};

const toUser = (u: SbUser | Session["user"] | null | undefined): User | null =>
  u ? { id: u.id, email: u.email ?? "", name: (u.user_metadata?.name as string | undefined) ?? undefined } : null;

/** Rows come back snake_case from Postgres. */
interface Row {
  public_id: string;
  status: OrderStatus;
  quantity: number;
  unit_price_paise: number;
  shipping_paise: number;
  total_paise: number;
  customer_name: string;
  phone: string;
  email: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pincode: string;
  notes: string | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  courier: string | null;
  tracking_number: string | null;
  created_at: string;
  paid_at: string | null;
  packed_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
}

const toOrder = (r: Row): Order => ({
  id: r.public_id,
  status: r.status,
  quantity: r.quantity,
  unitPricePaise: r.unit_price_paise,
  shippingPaise: r.shipping_paise,
  totalPaise: r.total_paise,
  customer: {
    name: r.customer_name, phone: r.phone, email: r.email, line1: r.address_line1,
    line2: r.address_line2 ?? "", city: r.city, state: r.state, pincode: r.pincode,
  },
  notes: r.notes ?? "",
  razorpayOrderId: r.razorpay_order_id,
  razorpayPaymentId: r.razorpay_payment_id,
  courier: r.courier,
  trackingNumber: r.tracking_number,
  createdAt: r.created_at,
  paidAt: r.paid_at,
  packedAt: r.packed_at,
  shippedAt: r.shipped_at,
  deliveredAt: r.delivered_at,
});

/** Edge functions return { error } with a readable message; surface it. */
async function call<T>(fn: string, body: unknown): Promise<T> {
  const { data, error } = await client().functions.invoke(fn, { body: body as Record<string, unknown> });
  if (error) {
    let message = error.message;
    const ctx = (error as { context?: Response }).context;
    if (ctx && typeof ctx.json === "function") {
      try {
        const j = (await ctx.json()) as { error?: string };
        if (j.error) message = j.error;
      } catch {
        /* keep default message */
      }
    }
    throw new Error(message);
  }
  return data as T;
}

export const liveApi: Api = {
  mode: "live",
  async getUser() {
    const { data } = await client().auth.getSession();
    return toUser(data.session?.user);
  },
  onAuthChange(cb) {
    const { data } = client().auth.onAuthStateChange((_e, s) => cb(toUser(s?.user)));
    return () => data.subscription.unsubscribe();
  },
  async signUp(email, password, name) {
    const { data, error } = await client().auth.signUp({
      email: email.trim(),
      password,
      options: { data: { name: name.trim() } },
    });
    if (error) throw new Error(error.message);
    return { user: toUser(data.session?.user), needsConfirmation: !data.session };
  },
  async signIn(email, password) {
    const { data, error } = await client().auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw new Error(error.message);
    return toUser(data.user) as User;
  },
  async signOut() {
    await client().auth.signOut();
  },
  async createOrder(input: OrderInput) {
    return call<PaymentSession>("create-order", input);
  },
  async verifyPayment(proof: PaymentProof) {
    const r = await call<{ order: Row }>("verify-payment", proof);
    return toOrder(r.order);
  },
  async listOrders() {
    const { data, error } = await client().from("orders").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data as Row[]).map(toOrder);
  },
  async getOrder(id) {
    const { data, error } = await client().from("orders").select("*").eq("public_id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? toOrder(data as Row) : null;
  },
};
