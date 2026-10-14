import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const STATEMENT =
  "JUNO.1 is a compact unit built to be small, solid and simple to live with. Four ports. One flexible lead. Firmware you can keep up to date.";

/** The one scroll-linked moment: each word lights up from grey to white as you scroll past. */
function ScrubStatement(): React.ReactElement {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".scrub-word",
          { color: "#3a3a3e" },
          {
            color: "#ffffff",
            ease: "none",
            stagger: 0.12,
            scrollTrigger: {
              trigger: root.current,
              start: "top 75%",
              end: "bottom 55%",
              scrub: true,
            },
          }
        );
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className="common-padding bg-surface">
      <div className="screen-max-width">
        <p className="max-w-[24ch] font-display text-3xl font-medium leading-[1.25] tracking-tight sm:text-4xl md:text-5xl">
          {STATEMENT.split(" ").map((word, i) => (
            <span key={i} className="scrub-word">
              {word}{" "}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}

export default ScrubStatement;
