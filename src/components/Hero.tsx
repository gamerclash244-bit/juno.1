import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Pause, Play, RotateCcw } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Wordmark from "./Wordmark";
import { SITE } from "../constants/site";
import { HERO_PHOTO, HERO_VIDEO } from "../constants/gallery";
import { useReducedMotion } from "../hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

/**
 * Hero: a full-screen video with the JUNO.1 wordmark over it.
 * Load: the video plays alone first; once it is 45% through, J-U-N-O-1 rises over it and the cream dot drops in like a full stop.
 * Scroll: the video frame shrinks into a rounded card while the text lifts away.
 */
const REVEAL_AT = 0.45;
function Hero(): React.ReactElement {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  const textIn = useRef<gsap.core.Timeline | null>(null);
  const [failed, setFailed] = useState(false);
  const [photoFailed, setPhotoFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [inView, setInView] = useState(true);
  const revealed = useRef(false);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // 1. The video arrives on its own, with nothing over it.
        gsap.from(".hero-frame", { opacity: 0, duration: 1.2, ease: "power1.out" });
        gsap.from(".hero-media", { scale: 1.1, duration: 2.4, ease: "power2.out" });

        // 2. At 45% of the video the text eases in (this timeline waits, paused, until then).
        // Long, overlapping tweens with soft deceleration keep the entrance smooth rather than snappy.
        textIn.current = gsap
          .timeline({ paused: true, defaults: { ease: "power2.out", force3D: true } })
          .from(".hero-scrim", { opacity: 0, duration: 1.8, ease: "power1.inOut" }, 0)
          .from(".wm-letter", { yPercent: 60, opacity: 0, duration: 1.4, stagger: 0.07 }, 0.15)
          .from(".wm-dot", { yPercent: -900, opacity: 0, duration: 1, ease: "bounce.out" }, "-=0.4")
          // The photo dissolves in over the title, with no pop or rotation.
          .from(".hero-photo", { opacity: 0, duration: 1.8, ease: "power1.inOut" }, 0.45)
          .from(".hero-in", { opacity: 0, y: 18, duration: 1.1, stagger: 0.16 }, 0.6)
          .from(".hero-cue", { opacity: 0, duration: 1.1 }, 0.9);

        // If this timeline is rebuilt (hot reload / media-query change) after the intro
        // was already revealed, jump it to the end instead of dropping the title back out.
        if (revealed.current) textIn.current.progress(1);

        // No pinned runway: the hero simply scrolls away, shrinking and fading as it goes.
        const scroll = { trigger: root.current, start: "top top", end: "bottom top", scrub: true };
        gsap.to(".hero-frame", { scale: 0.88, borderRadius: 40, ease: "none", scrollTrigger: scroll });
        gsap.to(".hero-media", { scale: 1.12, ease: "none", scrollTrigger: scroll });
        gsap.to(".hero-copy", { yPercent: -22, opacity: 0, ease: "none", scrollTrigger: { ...scroll, end: "65% top" } });
        gsap.to(".hero-cue", { opacity: 0, ease: "none", scrollTrigger: { ...scroll, end: "20% top" } });
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  // The video is a one-time intro: once it is 45% through, the text eases in over the remaining footage.
  const reveal = useCallback((): void => {
    if (revealed.current) return;
    revealed.current = true;
    textIn.current?.timeScale(1).play();
  }, []);

  // Timers cover a missing video or a stalled download so the text is never trapped off-screen.
  useEffect(() => {
    const v = video.current;
    if (!v) {
      const fallback = window.setTimeout(reveal, 800);
      return () => window.clearTimeout(fallback);
    }

    const onEnded = (): void => {
      setEnded(true);
      setPlaying(false);
      reveal();
    };
    const onProgress = (): void => {
      const { currentTime, duration } = v;
      if (!Number.isFinite(duration) || duration <= 0) return;
      if (currentTime / duration >= REVEAL_AT) reveal();
    };

    // Safety net if playback stalls: reveal after the 45% mark in wall-clock time.
    let fallback = 0;
    const onMetadata = (): void => {
      onProgress();
      window.clearTimeout(fallback);
      if (Number.isFinite(v.duration) && v.duration > 0) {
        fallback = window.setTimeout(reveal, v.duration * REVEAL_AT * 1000 + 2000);
      }
    };

    v.addEventListener("ended", onEnded);
    v.addEventListener("timeupdate", onProgress);
    v.addEventListener("loadedmetadata", onMetadata);
    if (v.readyState >= 1) onMetadata();

    return () => {
      v.removeEventListener("ended", onEnded);
      v.removeEventListener("timeupdate", onProgress);
      v.removeEventListener("loadedmetadata", onMetadata);
      window.clearTimeout(fallback);
    };
  }, [failed, reveal]);

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
    if (v.ended) return; // never restart the intro just because the hero scrolled back into view
    v.play()
      .then(() => setPlaying(true))
      .catch(() => {
        // Autoplay was blocked, so the video will not reach 45% on its own: show the copy now.
        setPlaying(false);
        reveal();
      });
  }, [reduced, inView, failed, reveal]);

  const toggle = (): void => {
    const v = video.current;
    if (!v) return;
    if (v.ended) {
      // Replay: the text steps aside, the intro runs again, the text returns at 45%.
      textIn.current?.timeScale(1.8).reverse();
      revealed.current = false;
      setEnded(false);
      v.currentTime = 0;
      void v.play().then(() => setPlaying(true));
    } else if (v.paused) {
      void v.play().then(() => setPlaying(true));
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const lastSource = HERO_VIDEO.sources.length - 1;

  return (
    <section ref={root} className="relative h-[calc(100dvh-48px)]" aria-label="JUNO.1">
      <div className="relative h-full overflow-hidden">
        {/* The video frame */}
        <div className="hero-frame absolute inset-0 overflow-hidden bg-black will-change-transform">
          <div className="hero-media absolute inset-0 will-change-transform">
            {failed ? (
              <div className="hero-glow absolute inset-0" aria-hidden />
            ) : (
              <video
                ref={video}
                className="hero-video h-full w-full"
                poster={HERO_VIDEO.poster}
                muted
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
          <div className="hero-scrim absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40" aria-hidden />
        </div>

        {/* Copy */}
        <div className="hero-copy relative z-10 flex h-full items-center px-5 sm:px-10">
          <div className="screen-max-width">
            <div className="relative">
              <h1 className="leading-none tracking-[-0.04em]" style={{ fontSize: "clamp(3rem, min(20vw, 34dvh), 16rem)" }}>
                <Wordmark />
              </h1>
              {/* The JUNO.1 photo dissolves in over the middle of the title */}
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center" aria-hidden>
                <div
                  className="hero-photo hero-photo-box"
                  style={{ "--ph": `${HERO_PHOTO.heightPct}%`, "--pw": `${HERO_PHOTO.widthPct}%` } as React.CSSProperties}
                >
                  {!photoFailed && (
                    <img
                      src={HERO_PHOTO.src}
                      alt=""
                      draggable={false}
                      onError={() => setPhotoFailed(true)}
                      className="photo-float h-full w-full select-none object-contain drop-shadow-[0_30px_45px_rgba(0,0,0,0.65)]"
                    />
                  )}
                </div>
              </div>
            </div>

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
            aria-label={ended ? "Replay intro video" : playing ? "Pause intro video" : "Play intro video"}
            className="absolute bottom-5 right-5 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60 sm:bottom-8 sm:right-10"
          >
            {ended ? <RotateCcw size={18} /> : playing ? <Pause size={18} /> : <Play size={18} />}
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
