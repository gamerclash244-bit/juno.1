import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Pause, Play } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Wordmark from "./Wordmark";
import { SITE } from "../constants/site";
import { HERO_VIDEO } from "../constants/gallery";
import { useReducedMotion } from "../hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

/**
 * Hero: a full-screen video with the JUNO.1 wordmark over it.
 * Load: the video eases in, J-U-N-O-1 rise, the cream dot drops in like a full stop.
 * Scroll: the video frame shrinks into a rounded card while the text lifts away.
 */
function Hero(): React.ReactElement {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [inView, setInView] = useState(true);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.from(".hero-frame", { opacity: 0, duration: 1.2, ease: "power1.out" })
          .from(".hero-media", { scale: 1.1, duration: 2, ease: "power2.out" }, 0)
          .from(".wm-letter", { yPercent: 45, opacity: 0, duration: 0.9, stagger: 0.08 }, 0.3)
          .from(".wm-dot", { yPercent: -900, opacity: 0, duration: 1, ease: "bounce.out" }, "-=0.35")
          .from(".hero-in", { opacity: 0, y: 14, duration: 0.7, stagger: 0.12 }, "-=0.5")
          .from(".hero-cue", { opacity: 0, duration: 0.8 }, "-=0.2");

        const scroll = { trigger: root.current, start: "top top", end: "bottom bottom", scrub: true };
        gsap.to(".hero-frame", { scale: 0.88, borderRadius: 40, ease: "none", scrollTrigger: scroll });
        gsap.to(".hero-media", { scale: 1.12, ease: "none", scrollTrigger: scroll });
        gsap.to(".hero-copy", { yPercent: -22, opacity: 0, ease: "none", scrollTrigger: { ...scroll, end: "70% bottom" } });
        gsap.to(".hero-cue", { opacity: 0, ease: "none", scrollTrigger: { ...scroll, end: "15% top" } });
      });
    },
    { scope: root }
  );

  // Play when allowed and on screen; pause when scrolled away to save battery.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(!!e?.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const v = video.current;
    if (!v || failed) return;
    if (reduced || !inView) {
      v.pause();
      setPlaying(false);
      return;
    }
    v.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, [reduced, inView, failed]);

  const toggle = (): void => {
    const v = video.current;
    if (!v) return;
    if (v.paused) void v.play().then(() => setPlaying(true));
    else {
      v.pause();
      setPlaying(false);
    }
  };

  const lastSource = HERO_VIDEO.sources.length - 1;

  return (
    <section ref={root} className="relative h-[170dvh]" aria-label="JUNO.1">
      <div className="sticky top-12 h-[calc(100dvh-48px)] overflow-hidden">
        {/* The video frame */}
        <div className="hero-frame absolute inset-0 overflow-hidden bg-[#0b0b0c] will-change-transform">
          <div className="hero-media absolute inset-0 will-change-transform">
            {failed ? (
              <div className="hero-glow absolute inset-0" aria-hidden />
            ) : (
              <video
                ref={video}
                className="h-full w-full object-cover"
                poster={HERO_VIDEO.poster}
                muted
                loop
                playsInline
                preload="auto"
                aria-hidden
                onError={(e) => {
                  // Only give up when the video itself fails (all sources tried), not one bad source.
                  if (e.target === e.currentTarget) setFailed(true);
                }}
              >
                {HERO_VIDEO.sources.map((s, i) => (
                  <source key={s.src} src={s.src} type={s.type} onError={i === lastSource ? () => setFailed(true) : undefined} />
                ))}
              </video>
            )}
          </div>
          {/* Keeps the text readable on any footage */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40" aria-hidden />
        </div>

        {/* Copy */}
        <div className="hero-copy relative z-10 flex h-full items-center px-5 sm:px-10">
          <div className="screen-max-width">
            <h1 className="leading-none tracking-[-0.04em]" style={{ fontSize: "clamp(3rem, 20vw, 16rem)" }}>
              <Wordmark />
            </h1>

            <p className="hero-in mt-8 max-w-[30ch] text-xl text-white/85 sm:text-2xl">{SITE.tagline}</p>

            <div className="hero-in mt-8 flex flex-wrap gap-3">
              <Link to="/buy" className="btn">Buy JUNO.1</Link>
              <Link to="/about" className="btn-ghost !bg-black/30 backdrop-blur">About JUNO.1</Link>
              <Link to="/firmware" className="btn-ghost !bg-black/30 backdrop-blur">Download firmware</Link>
            </div>
          </div>
        </div>

        {/* Pause / play (needed for autoplaying video) */}
        {!failed && (
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? "Pause background video" : "Play background video"}
            className="absolute bottom-5 right-5 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60 sm:bottom-8 sm:right-10"
          >
            {playing ? <Pause size={18} /> : <Play size={18} />}
          </button>
        )}

        {/* Scroll cue */}
        <div className="hero-cue pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2" aria-hidden>
          <span className="block h-10 w-px origin-top bg-gradient-to-b from-white/80 to-transparent" style={{ animation: "cue 2s ease-in-out infinite" }} />
        </div>
      </div>
    </section>
  );
}

export default Hero;
