import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import gsap from "gsap";
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

  // Start each page at the top when navigating
  useEffect(() => {
    window.scrollTo(0, 0);
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
