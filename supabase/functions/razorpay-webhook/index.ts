// Safety net: if a customer pays but closes the tab before the site can verify, Razorpay
// calls this webhook and the order is still marked paid. Deploy with --no-verify-jwt.
import { admin, hmacHex, safeEqual } from "../_shared/common.ts";

Deno.serve(async (req) => {
  const raw = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  const expected = await hmacHex(Deno.env.get("RAZORPAY_WEBHOOK_SECRET")!, raw);
  if (!safeEqual(expected, signature)) return new Response("invalid signature", { status: 400 });

  const event = JSON.parse(raw);
  const db = admin();

  if (event.event === "payment.captured" || event.event === "order.paid") {
    const p = event.payload?.payment?.entity;
    const orderId = p?.order_id ?? event.payload?.order?.entity?.id;
    if (orderId) {
      await db
        .from("orders")
        .update({ status: "paid", paid_at: new Date().toISOString(), razorpay_payment_id: p?.id ?? null })
        .eq("razorpay_order_id", orderId)
        .in("status", ["pending_payment", "payment_failed"]);
    }
  } else if (event.event === "payment.failed") {
    const orderId = event.payload?.payment?.entity?.order_id;
    if (orderId) {
      await db.from("orders").update({ status: "payment_failed" }).eq("razorpay_order_id", orderId).eq("status", "pending_payment");
    }
  }
  return new Response("ok");
});
