// Verifies Razorpay's signature (HMAC-SHA256 of "order_id|payment_id" with the key secret)
// and only then marks the order paid.
import { admin, cors, hmacHex, json, requireUser, safeEqual } from "../_shared/common.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);

  try {
    const user = await requireUser(req);
    if (!user) return json({ error: "Please sign in." }, 401);

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return json({ error: "Missing payment details." }, 400);
    }

    const expected = await hmacHex(
      Deno.env.get("RAZORPAY_KEY_SECRET")!,
      `${razorpay_order_id}|${razorpay_payment_id}`,
    );
    if (!safeEqual(expected, String(razorpay_signature))) {
      return json({ error: "Payment could not be verified." }, 400);
    }

    const db = admin();
    const { data: order } = await db
      .from("orders")
      .select("*")
      .eq("razorpay_order_id", razorpay_order_id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!order) return json({ error: "Order not found." }, 404);

    if (order.status === "pending_payment" || order.status === "payment_failed") {
      const { data: updated } = await db
        .from("orders")
        .update({ status: "paid", paid_at: new Date().toISOString(), razorpay_payment_id })
        .eq("id", order.id)
        .select("*")
        .single();
      return json({ order: updated ?? order });
    }
    return json({ order });
  } catch {
    return json({ error: "Something went wrong verifying the payment." }, 500);
  }
});
