import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Wordmark from "./Wordmark";
import { COLOURS, GALLERY } from "../constants/gallery";
import { useReducedMotion } from "../hooks/useReducedMotion";

/** An image that falls back to a tinted placeholder until the real file is added. */
function Pic({ src, alt, tint = "#2a2a2e", contain = false }: { src: string; alt: string; tint?: string; contain?: boolean }): React.ReactElement {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div
        className="flex h-full w-full flex-col items-center justify-center gap-3"
        style={{ background: `radial-gradient(60% 60% at 50% 45%, ${tint}, #0b0b0c 75%)` }}
        role="img"
        aria-label={alt}
      >
        <Wordmark className="text-5xl sm:text-7xl" />
        {import.meta.env.DEV && <p className="text-xs text-white/50">Add image: public{src}</p>}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      onError={() => setFailed(true)}
      className={`h-full w-full select-none ${contain ? "object-contain p-6 sm:p-10" : "object-cover"}`}
    />
  );
}

/** Slide 1: JUNO.1 in every colour. Cross-fades on a timer; the swatches jump to a colour. */
function ColourSlide({ active, reduced }: { active: boolean; reduced: boolean }): React.ReactElement {
  const [i, setI] = useState(0);
  const [hover, setHover] = useState(false);

  const pick = (n: number): void => {
    if (n === i) return;
    setI(n);
  };

  useEffect(() => {
    if (!active || hover || reduced || COLOURS.length < 2) return;
    const t = window.setTimeout(() => setI((v) => (v + 1) % COLOURS.length), 3200);
    return () => window.clearTimeout(t);
  }, [active, hover, reduced, i]);

  return (
    <div className="absolute inset-0" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {COLOURS.map((c, n) => {
        const isActive = n === i;
        return (
          <div
            key={c.name}
            className="absolute inset-0"
            style={{
              opacity: isActive ? 1 : 0,
              zIndex: isActive ? 2 : 1,
              // Pure dissolve: the new colour fades in over the old one, which then fades out.
              // Every layer keeps its own opacity transition, so rapid swatch clicks never snap.
              transition: isActive
                ? "opacity 900ms cubic-bezier(0.22,1,0.36,1)"
                : "opacity 500ms ease 950ms",
            }}
            aria-hidden={!isActive}
          >
            <Pic src={c.src} alt={`JUNO.1 in ${c.name}`} tint={c.swatch} contain />
          </div>
        );
      })}

      <div className="absolute inset-x-0 bottom-5 z-10 flex flex-col items-center gap-3 sm:bottom-7">
        <p key={i} className="pop-in text-base font-medium sm:text-lg" aria-live="polite">
          {COLOURS[i]?.name}
        </p>
        <div className="flex items-center gap-3" role="group" aria-label="Choose a colour">
          {COLOURS.map((c, n) => (
            <button
              key={c.name}
              type="button"
              onClick={() => pick(n)}
              aria-label={`Show ${c.name}`}
              aria-pressed={n === i}
              className={`h-6 w-6 rounded-full border transition duration-300 ${
                n === i ? "scale-110 border-white ring-2 ring-white/40 ring-offset-2 ring-offset-black" : "border-white/30 hover:scale-110"
              }`}
              style={{ background: c.swatch }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Home image viewer. Slide 1 shows the JUNO.1 colours; the rest come from GALLERY.
 * Slides glide and cross-fade into each other; swipe, arrow keys, arrows or dots to move.
 */
function ImageViewer(): React.ReactElement {
  const reduced = useReducedMotion();
  const slides: { title: string; src?: string; alt?: string }[] = [{ title: "Colours" }, ...GALLERY];
  const [index, setIndex] = useState(0);
  const [inView, setInView] = useState(true);
  const stage = useRef<HTMLDivElement>(null);
  const startX = useRef<number | null>(null);

  const go = (n: number): void => setIndex((n + slides.length) % slides.length);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(!!e?.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const onKey = (e: React.KeyboardEvent): void => {
    if (e.key === "ArrowRight") go(index + 1);
    if (e.key === "ArrowLeft") go(index - 1);
  };

  const layerStyle = (n: number): React.CSSProperties => ({
    opacity: n === index ? 1 : 0,
    transform: n === index ? "translateX(0) scale(1)" : `translateX(${n < index ? -7 : 7}%) scale(0.97)`,
    transition: reduced ? "none" : "opacity 900ms ease, transform 1200ms cubic-bezier(0.22,1,0.36,1)",
    pointerEvents: n === index ? "auto" : "none",
  });

  return (
    <section className="common-padding" aria-labelledby="viewer-heading">
      <div className="screen-max-width">
        <h2 id="viewer-heading" className="section-heading" data-split>
          Find your colour.
        </h2>
        <p className="prose-juno mt-5" data-reveal>
          JUNO.1 comes in different colours. Pick one, then swipe through to see it up close.
        </p>

        <div
          ref={stage}
          data-reveal="scale"
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-label="JUNO.1 images"
          onKeyDown={onKey}
          onPointerDown={(e) => (startX.current = e.clientX)}
          onPointerUp={(e) => {
            if (startX.current === null) return;
            const dx = e.clientX - startX.current;
            startX.current = null;
            if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
          }}
          className="relative mt-12 aspect-[4/3] w-full touch-pan-y overflow-hidden rounded-[2rem] bg-[#0b0b0c] sm:aspect-[16/9]"
        >
          {slides.map((s, n) => (
            <div
              key={s.title}
              className="absolute inset-0"
              style={layerStyle(n)}
              aria-hidden={n !== index}
              role="group"
              aria-roledescription="slide"
              aria-label={`${n + 1} of ${slides.length}: ${s.title}`}
            >
              {s.src ? (
                <Pic src={s.src} alt={s.alt ?? s.title} />
              ) : (
                <ColourSlide active={index === 0 && inView} reduced={reduced} />
              )}
            </div>
          ))}

          {slides.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(index - 1)}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 backdrop-blur transition hover:bg-white/20 sm:flex"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                onClick={() => go(index + 1)}
                aria-label="Next image"
                className="absolute right-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 backdrop-blur transition hover:bg-white/20 sm:flex"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}
        </div>

        {slides.length > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2" role="group" aria-label="Choose an image">
            {slides.map((s, n) => (
              <button
                key={s.title}
                type="button"
                onClick={() => go(n)}
                aria-label={`Show ${s.title}`}
                aria-current={n === index}
                className="group flex h-6 items-center"
              >
                <span
                  className={`block h-2 rounded-full transition-all duration-500 ${
                    n === index ? "w-8 bg-white" : "w-2 bg-white/30 group-hover:bg-white/60"
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default ImageViewer;
