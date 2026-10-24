/**
 * Shop settings. IMPORTANT: the price below is a PLACEHOLDER. Set your real price here
 * AND in the Supabase function secrets (JUNO_PRICE_PAISE / JUNO_SHIPPING_PAISE) so they
 * match. The server always charges its own price, so a mismatch makes checkout refuse
 * with "price changed" instead of charging the wrong amount.
 * Amounts are in paise (₹1 = 100 paise).
 */
export const PRODUCT = {
  name: "JUNO.1",
  pricePaise: 499900,
  shippingPaise: 0,
  maxQty: 5,
  includes: ["JUNO.1 unit", "1.5 m braided USB-A cable", "Lifetime firmware updates"],
} as const;

export const formatINR = (paise: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: paise % 100 === 0 ? 0 : 2,
  }).format(paise / 100);

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh",
  "Lakshadweep", "Puducherry",
] as const;

export type OrderStatus =
  | "pending_payment"
  | "payment_failed"
  | "paid"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled";

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: "Awaiting payment",
  payment_failed: "Payment failed",
  paid: "Paid",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

/** The tracking timeline, in order. */
export const TIMELINE: { key: "placed" | "paid" | "packed" | "shipped" | "delivered"; label: string; hint: string }[] = [
  { key: "placed", label: "Order placed", hint: "We have your order details." },
  { key: "paid", label: "Payment received", hint: "Your payment was confirmed." },
  { key: "packed", label: "Packed", hint: "Your JUNO.1 is tested and boxed." },
  { key: "shipped", label: "Shipped", hint: "On its way to you." },
  { key: "delivered", label: "Delivered", hint: "Delivered. Enjoy the music." },
];
