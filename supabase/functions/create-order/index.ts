// Creates the order row (status pending_payment) and a matching Razorpay order.
// The amount is ALWAYS computed here from server-side settings, never taken from the browser.
import { admin, cors, json, requireUser } from "../_shared/common.ts";

const PRICE = Number(Deno.env.get("JUNO_PRICE_PAISE"));
const SHIPPING = Number(Deno.env.get("JUNO_SHIPPING_PAISE") ?? "0");
const MAX_QTY = 5;

interface Body {
  quantity: number;
  notes?: string;
  expectedTotalPaise: number;
  customer: {
    name: string; phone: string; email: string; line1: string; line2?: string;
    city: string; state: string; pincode: string;
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);

  try {
    const user = await requireUser(req);
    if (!user) return json({ error: "Please sign in to place an order." }, 401);
    if (!PRICE || PRICE < 100) return json({ error: "The shop is not configured yet." }, 500);

    const b = (await req.json()) as Body;
    const c = b.customer ?? ({} as Body["customer"]);
    const qty = Math.floor(Number(b.quantity));
    if (!(qty >= 1 && qty <= MAX_QTY)) return json({ error: "Choose a quantity between 1 and 5." }, 400);

    const phone = String(c.phone ?? "").replace(/[\s-]/g, "");
    if (
      String(c.name ?? "").trim().length < 2 ||
      !/^[6-9]\d{9}$/.test(phone) ||
      !/^\S+@\S+\.\S+$/.test(String(c.email ?? "").trim()) ||
      String(c.line1 ?? "").trim().length < 5 ||
      String(c.city ?? "").trim().length < 2 ||
      !String(c.state ?? "").trim() ||
      !/^[1-9]\d{5}$/.test(String(c.pincode ?? "").trim())
    ) {
      return json({ error: "Check your delivery details and try again." }, 400);
    }

    const total = PRICE * qty + SHIPPING;
    if (total !== Number(b.expectedTotalPaise)) {
      return json({ error: "The price changed. Refresh the page and try again." }, 409);
    }

    const db = admin();
    const { data: order, error: insertError } = await db
      .from("orders")
      .insert({
        user_id: user.id,
        quantity: qty,
        unit_price_paise: PRICE,
        shipping_paise: SHIPPING,
        total_paise: total,
        customer_name: c.name.trim(),
        phone,
        email: c.email.trim(),
        address_line1: c.line1.trim(),
        address_line2: c.line2?.trim() || null,
        city: c.city.trim(),
        state: c.state.trim(),
        pincode: c.pincode.trim(),
        notes: (b.notes ?? "").slice(0, 300) || null,
      })
      .select("id, public_id")
      .single();
    if (insertError || !order) return json({ error: "Could not save your order. Try again." }, 500);

    const keyId = Deno.env.get("RAZORPAY_KEY_ID")!;
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET")!;
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa(`${keyId}:${keySecret}`),
      },
      body: JSON.stringify({
        amount: total,
        currency: "INR",
        receipt: order.public_id,
        notes: { order_id: order.public_id, user_id: user.id },
      }),
    });
    const rp = await res.json();
    if (!res.ok || !rp.id) {
      await db.from("orders").update({ status: "payment_failed" }).eq("id", order.id);
      return json({ error: "Could not start the payment. Try again." }, 502);
    }

    await db.from("orders").update({ razorpay_order_id: rp.id }).eq("id", order.id);
    return json({ orderId: order.public_id, amountPaise: total, razorpayOrderId: rp.id, keyId });
  } catch {
    return json({ error: "Something went wrong. Try again." }, 500);
  }
});
