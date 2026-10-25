import type { OrderStatus } from "../constants/shop";

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface Customer {
  name: string;
  phone: string;
  email: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  /** Customer-facing order ID, e.g. JN-4F8K2QX1 */
  id: string;
  status: OrderStatus;
  quantity: number;
  unitPricePaise: number;
  shippingPaise: number;
  totalPaise: number;
  customer: Customer;
  notes: string;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  courier: string | null;
  trackingNumber: string | null;
  createdAt: string;
  paidAt: string | null;
  packedAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
}

export interface OrderInput {
  quantity: number;
  customer: Customer;
  notes: string;
  /** What the page showed the buyer; the server refuses if its own price differs. */
  expectedTotalPaise: number;
}

/** What the payment step needs to open checkout. */
export interface PaymentSession {
  orderId: string;
  amountPaise: number;
  razorpayOrderId: string;
  /** Razorpay public key id (live mode only). */
  keyId: string;
}

export interface PaymentProof {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface Api {
  mode: "demo" | "live";
  getUser(): Promise<User | null>;
  onAuthChange(cb: (u: User | null) => void): () => void;
  signUp(email: string, password: string, name: string): Promise<{ user: User | null; needsConfirmation: boolean }>;
  signIn(email: string, password: string): Promise<User>;
  signOut(): Promise<void>;
  createOrder(input: OrderInput): Promise<PaymentSession>;
  verifyPayment(proof: PaymentProof): Promise<Order>;
  listOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | null>;
}
