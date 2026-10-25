import { useEffect, useLayoutEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useReveal } from "../hooks/useReveal";

/**
 * Shared shell for every page: skip link, navbar, page content (Outlet), footer.
 * Also runs the site-wide motion: each page eases in on navigation, then scroll reveals
 * (see useReveal) animate elements marked with data-split / data-reveal / data-stagger.
 */
function Layout(): React.ReactElement {
  const { pathname } = useLocation();
  const shell = useRef<HTMLDivElement>(null);

  // Never let the browser restore an old scroll position when switching pages.
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  }, []);

  // Start every page at the very top. `instant` matters: the site sets
  // `scroll-behavior: smooth`, and a smooth scroll gets cut short when the new page
  // changes height, leaving the visitor part-way down.
  useLayoutEffect(() => {
    ScrollTrigger.clearScrollMemory();
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    const id = requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "instant" }));
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  // Page-enter: a short rise so route changes feel continuous rather than abrupt
  useEffect(() => {
    const el = shell.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", clearProps: "opacity,transform" }
      );
    });
    return () => mm.revert();
  }, [pathname]);

  useReveal(shell, pathname);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-cap focus:px-4 focus:py-2 focus:text-black"
      >
        Skip to content
      </a>
      <Navbar />
      <div ref={shell}>
        <main id="main">
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  );
}

export default Layout;
