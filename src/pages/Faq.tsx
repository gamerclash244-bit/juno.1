import { Link } from "react-router-dom";
import { ArrowUpRight, ChevronDown, MessageCircle } from "lucide-react";
import { FAQ_GROUPS } from "../constants/faq";
import { SITE, mailto, whatsappLink } from "../constants/site";
import { usePageTitle } from "../hooks/usePageTitle";

/** FAQ page: grouped questions in native <details> accordions, so they work without JavaScript. */
function Faq(): React.ReactElement {
  usePageTitle("FAQ");

  return (
    <>
      <section className="px-5 pb-16 pt-16 sm:px-10 sm:pt-24">
        <div className="screen-max-width">
          <h1 className="page-title">Frequently asked questions</h1>
          <p className="prose-juno mt-8 text-xl">
            Setup, live use, firmware and ordering — the answers we send most often. If yours is not
            here, message us and we will add it.
          </p>

          <div className="mt-14 space-y-14">
            {FAQ_GROUPS.map((group) => (
              <div key={group.title}>
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-cap">
                  {group.title}
                </h2>
                <div className="mt-4 border-t border-line">
                  {group.items.map((item) => (
                    <details key={item.q} className="faq-item border-b border-line">
                      <summary className="flex items-start justify-between gap-6 py-5 text-lg font-medium text-white">
                        <span>{item.q}</span>
                        <ChevronDown
                          size={20}
                          aria-hidden
                          className="faq-chevron mt-1 shrink-0 text-gray"
                        />
                      </summary>
                      <p className="max-w-[62ch] pb-6 text-lg leading-relaxed text-gray-100">
                        {item.a}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Still stuck */}
      <section className="bg-surface px-5 py-20 sm:px-10 sm:py-28" aria-labelledby="faq-help-heading">
        <div className="screen-max-width grid gap-8 md:grid-cols-[1fr_1.4fr] md:gap-16">
          <h2 id="faq-help-heading" className="section-heading">
            Still need an answer?
          </h2>
          <div>
            <p className="prose-juno">
              Tell us your firmware version and what you are seeing. WhatsApp is quickest; email is
              better for photos and longer questions.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href={whatsappLink("Hi, I have a question about JUNO.1")}
                target="_blank"
                rel="noopener noreferrer"
                className="btn gap-2"
              >
                <MessageCircle size={18} aria-hidden />
                Chat on WhatsApp
                <ArrowUpRight size={16} aria-hidden />
              </a>
              <a
                href={mailto("JUNO.1 question")}
                className="btn-ghost gap-2 !px-5 !py-3 text-sm"
              >
                {SITE.email}
              </a>
            </div>
            <p className="mt-6 text-gray-100">
              Ready to order? Choose your colour on the{" "}
              <Link to="/buy" className="text-white underline decoration-cap underline-offset-4">
                Buy page
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

export default Faq;
