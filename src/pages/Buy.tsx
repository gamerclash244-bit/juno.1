import { ArrowUpRight, MessageCircle } from "lucide-react";
import { SITE, mailto, whatsappLink } from "../constants/site";
import { usePageTitle } from "../hooks/usePageTitle";

const ORDER_MESSAGE =
  "Hi, I'd like to order a JUNO.1.\n\nName:\nQuantity:\nColour:\nDelivery address (with PIN code):";

/** Orders are taken on WhatsApp only. */
function Buy(): React.ReactElement {
  usePageTitle("Buy");

  return (
    <section className="px-5 pb-24 pt-16 sm:px-10 sm:pt-24">
      <div className="screen-max-width">
        <h1 className="page-title" data-split>Buy JUNO.1</h1>
        <p className="prose-juno mt-8 max-w-[42ch] text-xl" data-reveal>
          We take orders on WhatsApp. Send us a message and we will help you place your order.
        </p>

        <div className="mt-12 flex flex-col items-start gap-4" data-stagger>
          <a
            href={whatsappLink(ORDER_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn gap-3 !px-8 !py-4 text-lg"
          >
            <MessageCircle size={22} aria-hidden />
            Order on WhatsApp
            <ArrowUpRight size={20} aria-hidden />
          </a>
          <p className="text-gray-100">
            WhatsApp number: <span className="text-white">{SITE.whatsappDisplay}</span>
          </p>
        </div>

        <div className="mt-16 max-w-xl border-t border-line pt-8" data-reveal>
          <p className="text-gray-100">
            The button opens a message with your name, quantity, colour and delivery address ready to fill in.
            Prefer email? Write to{" "}
            <a href={mailto("JUNO.1 order")} className="text-cap underline-offset-4 hover:underline">
              {SITE.email}
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}

export default Buy;
