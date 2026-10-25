import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Wordmark from "./Wordmark";
import { DETAIL_IMAGE } from "../constants/gallery";
import { firmwareReleases } from "../constants/firmware";
import { useReducedMotion } from "../hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

interface Chapter {
  label: string;
  stat: string;
  unit: string;
  title: string;
  body: string;
  /** Where the camera sits on the close-up: zoom, and pan in % of the image. */
  view: { scale: number; x: number; y: number };
  link?: { to: string; label: string };
}

const chapters: Chapter[] = [
  {
    label: "Ports",
    stat: "4",
    unit: "× 1/4″ mono jacks",
    title: "Four ports. One side.",
    body: "The ports sit together on one side, so every one is easy to see and plug into.",
    view: { scale: 2.3, x: 20, y: 4 },
  },
  {
    label: "Connection",
    stat: "1.5 m",
    unit: "braided USB-A cable (approx.)",
    title: "One cable to your MPC.",
    body: "A braided cable connects JUNO.1 to your MPC and stays tidy on stage.",
    view: { scale: 2.1, x: -22, y: -6 },
  },
  {
    label: "Control",
    stat: "1",
    unit: "footswitch",
    title: "Single-footswitch control.",
    body: "Start and stop with one footswitch. Improved START/STOP keeps timing adjustments smooth.",
    view: { scale: 2.6, x: 2, y: 16 },
  },
  {
    label: "Firmware",
    stat: `v${firmwareReleases[0]?.version ?? ""}`,
    unit: "latest firmware",
    title: "Always up to date.",
    body: "New releases are published on this site. Download the latest file and keep your JUNO.1 current.",
    view: { scale: 1.05, x: 0, y: 0 },
    link: { to: "/firmware", label: "Get the firmware" },
  },
];

/** The close-up photo, or a cropped wordmark placeholder until the photo is added. */
function Close(): React.ReactElement {
  const [failed, setFailed] = useState(false);
  if (!failed) {
    return (
      <img
        src={DETAIL_IMAGE}
        alt="Close-up of the JUNO.1 unit"
        draggable={false}
        onError={() => setFailed(true)}
        className="h-full w-full select-none object-cover"
      />
    );
  }
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ background: "radial-gradient(70% 70% at 40% 40%, #2c2c31, #0b0b0c 80%)" }}
      role="img"
      aria-label="JUNO.1 close-up placeholder"
    >
      <Wordmark className="text-[7rem] sm:text-[11rem]" />
    </div>
  );
}

/**
 * Apple-style product section. The page pins while you scroll: the camera glides across a close-up of
 * JUNO.1 (showing only a part of it at a time) and each stop calls out one specification.
 */
function SpecShowcase(): React.ReactElement {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const items = gsap.utils.toArray<HTMLElement>(".sc-chapter");
        const dots = gsap.utils.toArray<HTMLElement>(".sc-dot");
        const start = chapters[0]?.view ?? { scale: 1, x: 0, y: 0 };
        gsap.set(items, { opacity: 0, y: 36 });
        gsap.set(items.slice(0, 1), { opacity: 1, y: 0 });
        gsap.set(dots, { opacity: 0.25 });
        gsap.set(dots.slice(0, 1), { opacity: 1 });
        gsap.set(".sc-img", { scale: start.scale, xPercent: start.x, yPercent: start.y });

        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: `+=${chapters.length * 75}%`,
            pin: true,
            scrub: 0.7,
            anticipatePin: 1,
          },
        });

        chapters.forEach((c, i) => {
          const prevItem = items[i - 1];
          const item = items[i];
          const prevDot = dots[i - 1];
          const dot = dots[i];
          if (i === 0 || !prevItem || !item || !prevDot || !dot) return;
          tl.to(prevItem, { opacity: 0, y: -28, duration: 0.35, ease: "power1.in" }, i)
            .to(prevDot, { opacity: 0.25, duration: 0.3 }, i)
            .to(item, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, i + 0.3)
            .to(dot, { opacity: 1, duration: 0.3 }, i + 0.3)
            .to(".sc-img", { scale: c.view.scale, xPercent: c.view.x, yPercent: c.view.y, duration: 1 }, i - 0.05);
        });
        tl.to({}, { duration: 0.6 }); // hold on the last stop before the page moves on
      });
    },
    { scope: root, dependencies: [reduced], revertOnUpdate: true }
  );

  return (
    <section
      ref={root}
      aria-labelledby="spec-heading"
      className={`bg-surface px-5 sm:px-10 ${reduced ? "py-20" : "flex min-h-screen items-center py-6"}`}
    >
      <div className="screen-max-width">
        <h2 id="spec-heading" className="sr-only">JUNO.1 specifications</h2>

        <div className="grid items-center gap-6 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
          {/* The close-up window */}
          <div className="relative order-1 aspect-[16/10] overflow-hidden rounded-[2rem] bg-black lg:order-2 lg:aspect-[5/4]">
            <div className="sc-img h-full w-full will-change-transform">
              <Close />
            </div>
            <div className="pointer-events-none absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-white/10" />
          </div>

          {/* Spec chapters */}
          <div className="order-2 lg:order-1">
            <ul className={reduced ? "space-y-12" : "relative grid"} aria-label="Specifications">
              {chapters.map((c) => (
                <li key={c.label} className={`sc-chapter ${reduced ? "" : "[grid-area:1/1]"}`}>
                  <p className="text-sm font-medium uppercase tracking-[0.14em] text-gray">{c.label}</p>
                  <p
                    className="mt-3 font-display font-semibold leading-none tracking-[-0.04em] text-cap"
                    style={{ fontSize: "clamp(3.5rem, 11vw, 7.5rem)" }}
                  >
                    {c.stat}
                  </p>
                  <p className="mt-2 text-lg text-gray-100">{c.unit}</p>
                  <h3 className="mt-5 font-display text-2xl font-medium tracking-tight sm:text-3xl">{c.title}</h3>
                  <p className="prose-juno mt-3 max-w-[40ch]">{c.body}</p>
                  {c.link && (
                    <Link to={c.link.to} className="btn-ghost mt-6">
                      {c.link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            {!reduced && (
              <div className="mt-8 flex gap-2" aria-hidden>
                {chapters.map((c) => (
                  <span key={c.label} className="sc-dot h-1.5 w-8 rounded-full bg-white" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default SpecShowcase;
