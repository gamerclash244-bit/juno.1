import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Wordmark from "./Wordmark";
import { finishes } from "../constants/site";
import type { View } from "./ModelCanvas";

// three.js is heavy: load it after the heading has started animating
const ModelCanvas = lazy(() => import("./ModelCanvas"));

const VIEWS: { value: View; label: string }[] = [
  { value: "full", label: "Full view" },
  { value: "close", label: "Close-up" },
];

const RED = "#e5101c";
const RED_GLOW = "0 0 0.2em rgba(229, 16, 28, 0.65)";

/**
 * "Take a closer look": JUNO.1 heading, dark red-lit 3D model, colour dots and view buttons.
 * Page-load sequence: text materialises (reverse "snap"), the O runs the colour spectrum
 * and settles on red, the model rises from below, then the controls fade in.
 */
function Showcase(): React.ReactElement {
  const root = useRef<HTMLElement>(null);
  const holder = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>("full");
  const [finishId, setFinishId] = useState<string>(finishes[0]!.id);
  const [inView, setInView] = useState(true);
  const reducedMotion = useMemo(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );
  const finish = finishes.find((f) => f.id === finishId) ?? finishes[0]!;

  // Pause rendering while the viewer is scrolled out of sight
  useEffect(() => {
    const el = holder.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(!!entry?.isIntersecting), {
      rootMargin: "200px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const o = root.current?.querySelector<HTMLElement>(".wm-o");
        const hue = { h: 280 };
        const paint = (): void => {
          if (!o) return;
          o.style.color = `hsl(${hue.h} 100% 52%)`;
          o.style.textShadow = `0 0 0.2em hsl(${hue.h} 100% 50% / 0.75)`;
        };
        paint();

        // Reverse-snap: the line materialises from blurred "dust", drifting up into place
        const dust = (y: number) => ({ opacity: 0, y, x: -22, filter: "blur(16px)" });
        const settle = { opacity: 1, y: 0, x: 0, filter: "blur(0px)", clearProps: "filter", ease: "power2.out" };

        const tl = gsap.timeline();
        tl.fromTo(".snap-title", dust(42), { ...settle, duration: 1.9 }, 0)
          // The O runs the whole light spectrum (violet to red) once, then stays red
          .to(
            hue,
            {
              h: 0,
              duration: 2.8,
              ease: "power1.inOut",
              onUpdate: paint,
              onComplete: () => {
                if (!o) return;
                o.style.color = RED;
                o.style.textShadow = RED_GLOW;
              },
            },
            0.3
          )
          .fromTo(".snap-tag", dust(26), { ...settle, duration: 1.6 }, 1.1)
          .fromTo(".showcase-controls", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" }, 2.6);

        return () => {
          tl.kill();
        };
      });
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      className="relative overflow-hidden px-5 pb-16 pt-6 sm:px-10 sm:pb-24 sm:pt-8"
      aria-labelledby="showcase-heading"
    >
      {/* Deep red haze behind the model */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[28%] h-[75%]"
        style={{
          background:
            "radial-gradient(ellipse 55% 50% at 50% 50%, rgba(150,10,22,0.30), rgba(60,0,8,0.14) 50%, transparent 75%)",
        }}
      />

      <div className="screen-max-width relative z-10">
        <h1
          id="showcase-heading"
          className="snap-title leading-none tracking-[-0.04em]"
          style={{ fontSize: "clamp(3rem, 9vw, 8rem)" }}
        >
          <Wordmark dotClassName="bg-[#8f0e17]" className="[&_.wm-o]:text-[#e5101c]" />
        </h1>
        <h2 className="snap-tag section-heading mt-2 text-gray-100">Take a closer look.</h2>

        <div ref={holder} className="relative -mt-2 h-[58vh] min-h-[360px] w-full md:h-[66vh]">
          <Suspense fallback={null}>
            <ModelCanvas view={view} finishId={finishId} inView={inView} reducedMotion={reducedMotion} />
          </Suspense>
        </div>

        <div className="showcase-controls mt-6 flex flex-col items-center gap-5">
          <p className="text-sm font-light text-gray-100" aria-live="polite">
            JUNO.1 in {finish.label}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            <div role="radiogroup" aria-label="Finish" className="flex items-center gap-3">
              {finishes.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  role="radio"
                  aria-checked={f.id === finishId}
                  aria-label={f.label}
                  onClick={() => setFinishId(f.id)}
                  className={`h-7 w-7 rounded-full ring-1 ring-white/25 transition-shadow ${
                    f.id === finishId ? "ring-2 ring-[#e5101c] ring-offset-2 ring-offset-black" : "hover:ring-white/60"
                  }`}
                  style={{ backgroundColor: f.swatch }}
                />
              ))}
            </div>

            <div
              role="radiogroup"
              aria-label="Camera view"
              className="inline-flex rounded-full border border-white/20 p-1"
            >
              {VIEWS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={view === value}
                  onClick={() => setView(value)}
                  className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                    view === value ? "bg-[#c4121d] text-white" : "text-white hover:bg-white/10"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Showcase;
