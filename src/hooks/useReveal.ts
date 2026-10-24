import { useEffect } from "react";
import type { RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

/**
 * One shared motion system for every page. Mark up an element and it animates in as it
 * scrolls into view; nothing to wire per page.
 *
 *   data-split              headline: words rise out of a mask
 *   data-reveal             block: lifts and fades in
 *   data-reveal="line"      divider: draws in from the left
 *   data-reveal="scale"     card: eases up from a slightly smaller size
 *   data-reveal="fade"      fades only
 *   data-stagger            container: its direct children enter one after another
 *
 * Everything is skipped when the visitor prefers reduced motion.
 */
export function useReveal(scope: RefObject<HTMLElement>, key: string): void {
  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const restore: Array<() => void> = [];
        const trigger = (el: Element, start = "top 90%") => ({
          trigger: el,
          start,
          once: true,
        });

        // Headlines: split into words, each rising from behind a mask.
        root.querySelectorAll<HTMLElement>("[data-split]").forEach((el) => {
          if (el.children.length > 0) return;
          const text = el.textContent ?? "";
          const original = el.innerHTML;
          el.setAttribute("aria-label", text);
          el.innerHTML = text
            .split(/\s+/)
            .filter(Boolean)
            .map(
              (w) =>
                `<span aria-hidden="true" style="display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:0.12em;margin-bottom:-0.12em"><span class="split-word" style="display:inline-block;will-change:transform">${w}</span></span>`
            )
            .join(" ");
          restore.push(() => {
            el.innerHTML = original;
            el.removeAttribute("aria-label");
          });
          gsap.fromTo(
            el.querySelectorAll(".split-word"),
            { yPercent: 115, rotate: 3 },
            {
              yPercent: 0,
              rotate: 0,
              duration: 1,
              stagger: 0.07,
              ease: "power4.out",
              scrollTrigger: trigger(el, "top 92%"),
            }
          );
        });

        // Single blocks.
        root.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
          const kind = el.dataset.reveal;
          if (kind === "line") {
            gsap.fromTo(
              el,
              { scaleX: 0, transformOrigin: "left center" },
              { scaleX: 1, duration: 1.2, ease: "power3.inOut", scrollTrigger: trigger(el, "top 95%") }
            );
          } else if (kind === "fade") {
            gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 1, ease: "power1.out", scrollTrigger: trigger(el) });
          } else if (kind === "scale") {
            gsap.fromTo(
              el,
              { opacity: 0, y: 36, scale: 0.96 },
              { opacity: 1, y: 0, scale: 1, duration: 1, ease: "power3.out", scrollTrigger: trigger(el) }
            );
          } else {
            gsap.fromTo(
              el,
              { opacity: 0, y: 30 },
              { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", scrollTrigger: trigger(el) }
            );
          }
        });

        // Groups: children enter in sequence.
        root.querySelectorAll<HTMLElement>("[data-stagger]").forEach((el) => {
          const items = Array.from(el.children);
          if (!items.length) return;
          gsap.fromTo(
            items,
            { opacity: 0, y: 26 },
            {
              opacity: 1,
              y: 0,
              duration: 0.85,
              stagger: 0.11,
              ease: "power3.out",
              scrollTrigger: trigger(el, "top 88%"),
            }
          );
        });

        return () => restore.forEach((fn) => fn());
      });

      return () => mm.revert();
    },
    { scope, dependencies: [key], revertOnUpdate: true }
  );

  // Fonts and the lazy 3D model shift layout; re-measure trigger positions once they settle.
  useEffect(() => {
    let cancelled = false;
    const refresh = (): void => {
      if (!cancelled) ScrollTrigger.refresh();
    };
    document.fonts?.ready.then(refresh);
    const t = window.setTimeout(refresh, 900);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [key]);
}
