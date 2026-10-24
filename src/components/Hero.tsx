import { useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Wordmark from "./Wordmark";
import { SITE } from "../constants/site";

/**
 * Hero: the one orchestrated page-load moment.
 * J-U-N-O-1 rise in, then the cream dot drops in between them like a full stop.
 */
function Hero(): React.ReactElement {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.from(".wm-letter", { yPercent: 45, opacity: 0, duration: 0.9, stagger: 0.08 })
          .from(".wm-dot", { yPercent: -900, opacity: 0, duration: 1, ease: "bounce.out" }, "-=0.35")
          .from(".hero-in", { opacity: 0, y: 14, duration: 0.7, stagger: 0.12 }, "-=0.5");
      });
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      className="flex min-h-[calc(100dvh-64px)] items-center px-5 pb-16 pt-10 sm:px-10"
    >
      <div className="screen-max-width">
        <h1
          className="leading-none tracking-[-0.04em]"
          style={{ fontSize: "clamp(3rem, 20vw, 16rem)" }}
        >
          <Wordmark />
        </h1>

        <p className="hero-in mt-8 max-w-[30ch] text-xl text-gray-100 sm:text-2xl">
          {SITE.tagline}
        </p>

        <div className="hero-in mt-8 flex flex-wrap gap-3">
          <Link to="/buy" className="btn">
            Buy JUNO.1
          </Link>
          <Link to="/about" className="btn-ghost">
            About JUNO.1
          </Link>
          <Link to="/firmware" className="btn-ghost">
            Download firmware
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Hero;
