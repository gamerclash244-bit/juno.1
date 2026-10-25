import { PRODUCT } from "../constants/shop";
import type { OrderStatus } from "../constants/shop";
import type { Api, Order, OrderInput, PaymentProof, PaymentSession, User } from "./types";
import { validateCustomer } from "./validate";

/**
 * Demo backend: accounts and orders live in this browser's localStorage and "payment" is a
 * simulated sheet. It exists so the whole flow can be tried with no setup. It is NOT secure and
 * is replaced by liveApi.ts as soon as the Supabase environment variables are set.
 */
interface StoredUser extends User {
  hash: string;
}
interface Db {
  users: StoredUser[];
  orders: (Order & { userId: string })[];
}

const DB_KEY = "juno-demo-db";
const SESSION_KEY = "juno-demo-session";
const listeners = new Set<(u: User | null) => void>();

const read = (): Db => {
  try {
    return JSON.parse(localStorage.getItem(DB_KEY) ?? "") as Db;
  } catch {
    return { users: [], orders: [] };
  }
};
const write = (db: Db): void => localStorage.setItem(DB_KEY, JSON.stringify(db));

const sha = async (text: string): Promise<string> => {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
};
const pub = (u: StoredUser): User => ({ id: u.id, email: u.email, name: u.name });
const sessionUser = (): User | null => {
  const id = localStorage.getItem(SESSION_KEY);
  const u = read().users.find((x) => x.id === id);
  return u ? pub(u) : null;
};
const emit = (): void => listeners.forEach((cb) => cb(sessionUser()));
const need = (): User => {
  const u = sessionUser();
  if (!u) throw new Error("Please sign in first.");
  return u;
};
const code = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return "JN-" + Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};
const strip = ({ userId: _u, ...o }: Order & { userId: string }): Order => o;

export const demoApi: Api = {
  mode: "demo",
  async getUser() {
    return sessionUser();
  },
  onAuthChange(cb) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
  async signUp(email, password, name) {
    const db = read();
    const e = email.trim().toLowerCase();
    if (db.users.some((u) => u.email === e)) throw new Error("An account with this email already exists. Sign in instead.");
    const user: StoredUser = { id: crypto.randomUUID(), email: e, name: name.trim(), hash: await sha(e + password) };
    db.users.push(user);
    write(db);
    localStorage.setItem(SESSION_KEY, user.id);
    emit();
    return { user: pub(user), needsConfirmation: false };
  },
  async signIn(email, password) {
    const e = email.trim().toLowerCase();
    const u = read().users.find((x) => x.email === e);
    if (!u || u.hash !== (await sha(e + password))) throw new Error("Email or password is incorrect.");
    localStorage.setItem(SESSION_KEY, u.id);
    emit();
    return pub(u);
  },
  async signOut() {
    localStorage.removeItem(SESSION_KEY);
    emit();
  },
  async createOrder(input: OrderInput): Promise<PaymentSession> {
    const user = need();
    if (Object.keys(validateCustomer(input.customer)).length) throw new Error("Check your delivery details.");
    const qty = Math.min(PRODUCT.maxQty, Math.max(1, Math.floor(input.quantity)));
    const total = PRODUCT.pricePaise * qty + PRODUCT.shippingPaise;
    if (total !== input.expectedTotalPaise) throw new Error("The price changed. Refresh the page and try again.");
    const db = read();
    const id = code();
    db.orders.push({
      userId: user.id, id, status: "pending_payment", quantity: qty, unitPricePaise: PRODUCT.pricePaise,
      shippingPaise: PRODUCT.shippingPaise, totalPaise: total, customer: input.customer, notes: input.notes,
      razorpayOrderId: "demo_order_" + id, razorpayPaymentId: null, courier: null, trackingNumber: null,
      createdAt: new Date().toISOString(), paidAt: null, packedAt: null, shippedAt: null, deliveredAt: null,
    });
    write(db);
    return { orderId: id, amountPaise: total, razorpayOrderId: "demo_order_" + id, keyId: "demo" };
  },
  async verifyPayment(proof: PaymentProof) {
    const user = need();
    const db = read();
    const o = db.orders.find((x) => x.razorpayOrderId === proof.razorpay_order_id && x.userId === user.id);
    if (!o) throw new Error("Order not found.");
    if (o.status === "pending_payment" || o.status === "payment_failed") {
      o.status = "paid";
      o.paidAt = new Date().toISOString();
      o.razorpayPaymentId = proof.razorpay_payment_id;
      write(db);
    }
    return strip(o);
  },
  async listOrders() {
    const user = need();
    return read().orders.filter((o) => o.userId === user.id).map(strip).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async getOrder(id) {
    const user = need();
    const o = read().orders.find((x) => x.id === id && x.userId === user.id);
    return o ? strip(o) : null;
  },
};

/** Demo only: move an order along so the tracking timeline can be previewed. */
export function demoAdvance(id: string): void {
  const db = read();
  const o = db.orders.find((x) => x.id === id);
  if (!o) return;
  const next: Partial<Record<OrderStatus, OrderStatus>> = { paid: "packed", packed: "shipped", shipped: "delivered" };
  const n = next[o.status];
  if (!n) return;
  o.status = n;
  const now = new Date().toISOString();
  if (n === "packed") o.packedAt = now;
  if (n === "shipped") {
    o.shippedAt = now;
    o.courier = "Demo Courier";
    o.trackingNumber = "DEMO" + Math.floor(Math.random() * 1e9);
  }
  if (n === "delivered") o.deliveredAt = now;
  write(db);
}
