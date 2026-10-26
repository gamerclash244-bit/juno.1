import { SITE } from "./site";

/**
 * Facts shown in the "Good to know" panel on the Buy page.
 * Price, payment and delivery are settled on WhatsApp, so they are worded that way —
 * update them here if you publish fixed prices or shipping charges.
 */
/** Unit price in rupees. `was` is the struck-through original; set it to null to hide it. */
export const PRICE = { current: 8000, was: 9999 as number | null } as const;

/** 8000 → "₹8,000" (Indian digit grouping). */
export const formatINR = (amount: number): string => `₹${amount.toLocaleString("en-IN")}`;

export interface OrderFact {
  label: string;
  value: string;
}

export const ORDER_FACTS: OrderFact[] = [
  {
    label: "Price",
    value: PRICE.was ? `${formatINR(PRICE.current)} (regular ${formatINR(PRICE.was)})` : formatINR(PRICE.current),
  },
  { label: "Payment", value: "Arranged with us on WhatsApp" },
  { label: "Delivery", value: "Charges and timing confirmed on WhatsApp for your PIN code" },
  { label: "In the box", value: "JUNO.1 unit and the braided USB-A cable" },
  { label: "Colours", value: "Matte black, matte ice blue and matte red (finish may change)" },
  { label: "Firmware", value: "Updates are downloaded from the firmware page" },
  { label: "Support", value: `WhatsApp ${SITE.whatsappDisplay} · ${SITE.email}` },
];
