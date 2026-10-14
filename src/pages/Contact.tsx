import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, CalendarDays, Check, Clock, Copy, Globe, Mail, MessageCircle } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SITE, contactInfo, mailto, whatsappLink } from "../constants/site";
import { usePageTitle } from "../hooks/usePageTitle";

const RED = "#e5101c";

interface Detail {
  icon: React.ReactElement;
  label: string;
  value: string;
}

const details: Detail[] = [
  { icon: <Clock size={20} aria-hidden />, label: "Reply time", value: contactInfo.replyTime },
  { icon: <CalendarDays size={20} aria-hidden />, label: "Support hours", value: contactInfo.hours },
  { icon: <Globe size={20} aria-hidden />, label: "Languages", value: contactInfo.languages },
];

/** Contact page: email and WhatsApp cards, reply time and hours, and what to include in a message. */
function Contact(): React.ReactElement {
  usePageTitle("Contact");
  const root = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState<"email" | "whatsapp" | null>(null);

  const copy = async (kind: "email" | "whatsapp", text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      // Clipboard blocked: the links still work
    }
  };

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline();
        tl.fromTo(
          ".c-title",
          { opacity: 0, y: 36, x: -18, filter: "blur(14px)" },
          { opacity: 1, y: 0, x: 0, filter: "blur(0px)", clearProps: "filter", duration: 1.5, ease: "power2.out" },
          0
        )
          .fromTo(".c-intro", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" }, 0.5)
          .fromTo(
            ".c-card",
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: "power3.out" },
            0.8
          )
          .fromTo(".c-more", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" }, 1.4);
        return () => {
          tl.kill();
        };
      });
    },
    { scope: root }
  );

  const cardBase =
    "c-card flex flex-col rounded-3xl border border-white/10 bg-[#0d0507] p-7 sm:p-9 transition-colors hover:border-[#e5101c]/50";
  const iconBadge =
    "flex h-12 w-12 items-center justify-center rounded-full border border-[#e5101c]/40 text-[#e5101c]";
  const redBtn =
    "inline-flex items-center justify-center gap-2 rounded-full bg-[#c4121d] px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-[#e5101c]";

  return (
    <div ref={root} className="relative overflow-hidden">
      {/* Deep red haze, matching the home page */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[70%]"
        style={{
          background:
            "radial-gradient(ellipse 60% 55% at 50% 20%, rgba(150,10,22,0.26), rgba(60,0,8,0.12) 50%, transparent 78%)",
        }}
      />

      <div className="relative z-10 px-5 pb-20 pt-16 sm:px-10 sm:pb-28 sm:pt-24">
        <div className="screen-max-width">
          <h1 className="c-title page-title">
            Get in <span style={{ color: RED, textShadow: "0 0 0.2em rgba(229,16,28,0.6)" }}>touch.</span>
          </h1>
          <p className="c-intro prose-juno mt-8 text-xl">
            Questions about {SITE.name}, help with a firmware update, or just want to say hello? Pick
            whichever way suits you best and we&apos;ll get back to you.
          </p>

          {/* Email + WhatsApp */}
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            <section className={cardBase} aria-labelledby="email-heading">
              <span className={iconBadge}>
                <Mail size={22} aria-hidden />
              </span>
              <h2 id="email-heading" className="mt-6 font-display text-2xl font-medium tracking-tight">
                Email
              </h2>
              <p className="mt-2 text-gray-100">Best for detailed questions, photos and screenshots.</p>
              <p className="mt-5 break-all font-display text-base text-white min-[420px]:text-lg sm:text-xl">{SITE.email}</p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a href={mailto("JUNO.1 support")} className={redBtn}>
                  Send an email
                  <ArrowUpRight size={18} aria-hidden />
                </a>
                <button
                  type="button"
                  onClick={() => copy("email", SITE.email)}
                  className="btn-ghost !px-4 !py-3 text-sm"
                  aria-live="polite"
                >
                  {copied === "email" ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
                  {copied === "email" ? "Copied" : "Copy"}
                </button>
              </div>
            </section>

            <section className={cardBase} aria-labelledby="whatsapp-heading">
              <span className={iconBadge}>
                <MessageCircle size={22} aria-hidden />
              </span>
              <h2 id="whatsapp-heading" className="mt-6 font-display text-2xl font-medium tracking-tight">
                WhatsApp
              </h2>
              <p className="mt-2 text-gray-100">{contactInfo.quickReply}. Best for quick questions.</p>
              <p className="mt-5 font-display text-lg text-white sm:text-xl">{SITE.whatsappDisplay}</p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a
                  href={whatsappLink("Hi, I have a question about JUNO.1")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={redBtn}
                >
                  Chat on WhatsApp
                  <ArrowUpRight size={18} aria-hidden />
                </a>
                <button
                  type="button"
                  onClick={() => copy("whatsapp", SITE.whatsappDisplay)}
                  className="btn-ghost !px-4 !py-3 text-sm"
                  aria-live="polite"
                >
                  {copied === "whatsapp" ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
                  {copied === "whatsapp" ? "Copied" : "Copy"}
                </button>
              </div>
            </section>
          </div>

          {/* Reply time, hours, languages */}
          <ul className="c-more mt-6 grid gap-6 rounded-3xl border border-white/10 p-7 sm:grid-cols-3 sm:p-9">
            {details.map((d) => (
              <li key={d.label} className="flex items-start gap-4">
                <span className="mt-0.5 text-[#e5101c]">{d.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-white">{d.label}</p>
                  <p className="mt-1 text-gray-100">{d.value}</p>
                </div>
              </li>
            ))}
          </ul>

          {/* What to include */}
          <div className="c-more mt-16 grid gap-8 md:grid-cols-[1fr_1.4fr] md:gap-16">
            <h2 className="section-heading">Help us help you faster</h2>
            <div>
              <p className="prose-juno">Please include these in your message so we can answer in one go:</p>
              <ul className="mt-5 space-y-3">
                {contactInfo.include.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-lg text-gray-100">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e5101c]" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="prose-juno mt-8">
                Having trouble with an update? Check the{" "}
                <Link to="/firmware" className="text-white underline decoration-[#e5101c] underline-offset-4">
                  firmware page
                </Link>{" "}
                first, as the install steps and known fixes are there.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
