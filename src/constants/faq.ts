import { firmwareReleases } from "./firmware";
import { PRICE, formatINR } from "./order";

/**
 * Questions shown on /faq. Answers stick to what the product pages and firmware notes
 * already say; anything about price, delivery or availability points to WhatsApp.
 */
export interface FaqItem {
  q: string;
  a: string;
}

export interface FaqGroup {
  title: string;
  items: FaqItem[];
}

const latest = firmwareReleases[0]?.version ?? "latest";

export const FAQ_GROUPS: FaqGroup[] = [
  {
    title: "Getting started",
    items: [
      {
        q: "What is JUNO.1?",
        a: "JUNO.1 is a compact performance controller for live music. It brings START/STOP control to a single footswitch so you can restart a sequence, fix timing and keep playing without reaching for a screen.",
      },
      {
        q: "What comes in the box?",
        a: "Your JUNO.1 unit and the braided USB-A cable used to connect it to your MPC. If you want a footswitch included with your order, ask us on WhatsApp and we will confirm what we can send.",
      },
      {
        q: "Which colours can I choose?",
        a: "Matte black, matte ice blue and matte red. Pick one on the Buy page and the photo switches to that colour. The finish may change slightly between batches, so we confirm the colour with you on WhatsApp before dispatch.",
      },
      {
        q: "How do I connect it?",
        a: "Plug the braided USB-A cable into JUNO.1 and into your MPC. The four 1/4\" mono jacks on the unit are for plugging in a footswitch.",
      },
      {
        q: "Do I need to install an app?",
        a: "No. JUNO.1 works over the cable — the only download is the firmware updater on the firmware page, and you only need that when you want to update.",
      },
    ],
  },
  {
    title: "Using it live",
    items: [
      {
        q: "What does single-footswitch control mean?",
        a: "One switch handles START/STOP, so timing changes happen under your foot instead of on screen. Fewer taps means fewer interruptions in the middle of a performance.",
      },
      {
        q: "Can I restart a sequence without stopping playback?",
        a: "Yes. From firmware 7.1.3 you can restart a sequence from the beginning without manually stopping playback first.",
      },
      {
        q: "Does it help when performing with singers?",
        a: "Firmware 7.1.3 reworked the synchronisation workflow for performances with singers, and reduced the response delay compared with earlier versions.",
      },
      {
        q: "What if the timing drifts during a show?",
        a: "Recovery from timing mismatches was improved in 7.1.3. You can pull the set back into time from the footswitch instead of stopping and starting again.",
      },
      {
        q: "Can I use my own footswitch?",
        a: "Yes — any footswitch with a 1/4\" mono jack plugs into the ports on the side of the unit. The ports sit together so each one is easy to see when you are setting up in a dark venue.",
      },
    ],
  },
  {
    title: "Firmware and updates",
    items: [
      {
        q: "What is the latest firmware?",
        a: `Version ${latest}. It is available on the firmware page together with the notes for that release.`,
      },
      {
        q: "How do I update JUNO.1?",
        a: "Download the updater from the firmware page, double-click the .exe, plug JUNO.1 into your PC — the indicator in the updater turns green — then press Update. Your unit is then on the latest firmware.",
      },
      {
        q: "Do I need a computer to update?",
        a: "Yes. The updater is a Windows .exe, so you need a Windows PC and the JUNO.1 cable for a few minutes.",
      },
      {
        q: "The update did not work. What now?",
        a: "Note the version you were installing and what the updater or the unit showed, then message us on WhatsApp or email support. Photos of the screen help us answer in one go.",
      },
    ],
  },
  {
    title: "Orders, delivery and support",
    items: [
      {
        q: "How do I place an order?",
        a: "Open the Buy page, choose your colour and quantity, fill in your name, delivery address and PIN code, then press Send order on WhatsApp. Your details are already written into the message, so you only have to send it.",
      },
      {
        q: "How much does JUNO.1 cost?",
        a: `JUNO.1 is ${formatINR(PRICE.current)} at the moment${
          PRICE.was ? `, down from ${formatINR(PRICE.was)}` : ""
        }. That is the unit price — delivery is confirmed for your PIN code on WhatsApp when you order.`,
      },
      {
        q: "How do I pay?",
        a: "Payment is arranged with us on WhatsApp once your order and delivery details are confirmed.",
      },
      {
        q: "How long does delivery take?",
        a: "Delivery charges and timing depend on your PIN code, so we confirm both on WhatsApp before you pay.",
      },
      {
        q: "Can I order more than one?",
        a: "Yes. Use the quantity control on the Buy page — the number is included in the WhatsApp message.",
      },
      {
        q: "Where do I get help?",
        a: "Message us on WhatsApp for quick questions, or email support for anything detailed. We usually reply within 24–48 hours, Monday to Saturday.",
      },
    ],
  },
];
