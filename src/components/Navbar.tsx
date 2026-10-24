import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import gsap from "gsap";
import Wordmark from "./Wordmark";
import LiquidGlassDefs from "./LiquidGlassDefs";
import { navItems } from "../constants/site";
import type { NavItem } from "../constants/site";
import { useAuth } from "../context/AuthContext";
import { makeDisplacementMap, supportsRefraction } from "../lib/liquidGlass";

const linkBase =
  "relative z-10 inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium transition-colors duration-300";

function Navbar(): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [barMap, setBarMap] = useState("");
  const [pillMap, setPillMap] = useState("");
  const { user } = useAuth();
  const { pathname } = useLocation();

  const shellRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const placed = useRef(false);

  // "Orders" only appears once someone is signed in.
  const items: NavItem[] = useMemo(
    () => (user ? [...navItems, { label: "Orders", to: "/orders" }] : navItems),
    [user]
  );

  // Turn on real refraction in Chromium; other browsers keep the blur-only glass.
  useEffect(() => {
    if (supportsRefraction()) document.documentElement.classList.add("lg-refract");
  }, []);

  // Build the bar's displacement map at its real size.
  useLayoutEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;
    const build = (): void => {
      const r = shell.getBoundingClientRect();
      if (r.width > 0) setBarMap(makeDisplacementMap(r.width, r.height, Math.min(26, r.height / 2)));
    };
    build();
    const ro = new ResizeObserver(build);
    ro.observe(shell);
    return () => ro.disconnect();
  }, [items.length]);

  /** Slide the glass pill under a link, stretching and settling like a drop of liquid. */
  const moveTo = useCallback((link: HTMLElement | null, instant = false) => {
    const pill = pillRef.current;
    const list = listRef.current;
    if (!pill || !list) return;
    if (!link) {
      gsap.to(pill, { opacity: 0, scale: 0.85, duration: 0.3, overwrite: "auto" });
      return;
    }
    const lr = list.getBoundingClientRect();
    const r = link.getBoundingClientRect();
    const x = r.left - lr.left;
    if (instant || !placed.current) {
      gsap.set(pill, { x, width: r.width, opacity: 1, scale: 1 });
      placed.current = true;
    } else {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      gsap.to(pill, {
        x,
        width: r.width,
        opacity: 1,
        duration: reduce ? 0 : 0.8,
        ease: "elastic.out(1, 0.7)",
        overwrite: "auto",
      });
      if (!reduce) {
        gsap.fromTo(
          pill,
          { scaleX: 1.12, scaleY: 0.86 },
          { scaleX: 1, scaleY: 1, duration: 0.9, ease: "elastic.out(1, 0.45)" }
        );
      }
    }
    // Refraction map for this pill's size.
    setPillMap(makeDisplacementMap(r.width, r.height - 6, 18));
  }, []);

  const activeLink = useCallback(
    (): HTMLElement | null => listRef.current?.querySelector<HTMLElement>('a[aria-current="page"]') ?? null,
    []
  );

  // Park the pill under the current page (after route changes and layout changes).
  useLayoutEffect(() => {
    const settle = (instant: boolean): void => moveTo(activeLink(), instant);
    // Wait a frame so NavLink has applied aria-current.
    const id = requestAnimationFrame(() => settle(!placed.current));
    const ro = new ResizeObserver(() => settle(true));
    if (listRef.current) ro.observe(listRef.current);
    return () => {
      cancelAnimationFrame(id);
      ro.disconnect();
    };
  }, [pathname, items.length, moveTo, activeLink]);

  // Close the mobile menu after navigating.
  useEffect(() => setOpen(false), [pathname]);

  // The bar drops in once, on first load.
  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(el, { y: -26, scale: 0.94, duration: 1.1, ease: "elastic.out(1, 0.6)", delay: 0.15 });
    });
    return () => mm.revert();
  }, []);

  // A moving highlight that follows the pointer across the glass.
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>): void => {
    const el = shellRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  const renderLink = (item: NavItem): React.ReactElement =>
    item.external ? (
      <a
        href={item.to}
        target={item.to.startsWith("http") ? "_blank" : undefined}
        rel={item.to.startsWith("http") ? "noopener noreferrer" : undefined}
        className={`${linkBase} text-white/70 hover:text-white`}
      >
        {item.label}
      </a>
    ) : (
      <NavLink
        to={item.to}
        end={item.to === "/"}
        onMouseEnter={(e) => moveTo(e.currentTarget)}
        onFocus={(e) => moveTo(e.currentTarget)}
        className={({ isActive }) =>
          `${linkBase} ${isActive ? "text-white" : "text-white/65 hover:text-white"}`
        }
      >
        {item.label}
      </NavLink>
    );

  return (
    <header className="juno-header px-5 sm:px-10">
      <LiquidGlassDefs barMap={barMap} pillMap={pillMap} />

      <nav className="screen-max-width flex min-h-[76px] items-center justify-between" aria-label="Main navigation">
        <Link to="/" className="relative z-10 text-xl" aria-label="JUNO.1 home">
          <Wordmark />
        </Link>

        {/* Desktop: liquid glass capsule */}
        <div ref={shellRef} className="lg-shell hidden sm:block" onPointerMove={onPointerMove}>
          <span className="lg-body" aria-hidden="true" />
          <span ref={pillRef} className="lg-pill" aria-hidden="true">
            <span className="lg-pill-shine" />
          </span>
          <ul
            ref={listRef}
            className="relative z-10 flex items-center gap-1 p-1.5"
            onMouseLeave={() => moveTo(activeLink())}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) moveTo(activeLink());
            }}
          >
            {items.map((item) => (
              <li key={item.label} className="list-none">
                {renderLink(item)}
              </li>
            ))}
          </ul>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="lg-round relative z-10 flex h-11 w-11 items-center justify-center rounded-full text-white sm:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <ul id="mobile-menu" className="lg-mobile mb-3 flex flex-col gap-1 p-2 sm:hidden">
          {items.map((item) => (
            <li key={item.label} className="list-none">
              {item.external ? (
                <a
                  href={item.to}
                  className="block rounded-2xl px-4 py-3 text-lg text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {item.label}
                </a>
              ) : (
                <NavLink
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `block rounded-2xl px-4 py-3 text-lg transition-colors ${
                      isActive ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}

export default Navbar;
