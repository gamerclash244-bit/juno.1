import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Wordmark from "./Wordmark";
import { navItems } from "../constants/site";

const linkBase =
  "relative z-10 inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium transition-colors duration-300";

function Navbar(): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [showPill, setShowPill] = useState(false);
  useEffect(() => {
  if (!showPill) return;

  const timer = window.setTimeout(() => {
    setShowPill(false);
  }, 600);

  return () => window.clearTimeout(timer);
}, [showPill]);
  const [indicator, setIndicator] = useState({
    left: 0,
    width: 0,
    visible: false,
  });

  const navRef = useRef<HTMLUListElement>(null);
  const { pathname } = useLocation();

  // Position the glass pill behind the active page.
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const updateIndicator = () => {
      const activeLink = nav.querySelector<HTMLAnchorElement>(
        'a[aria-current="page"]'
      );

      if (!activeLink) {
        setIndicator((previous) => ({
          ...previous,
          visible: false,
        }));
        return;
      }

      const navRect = nav.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();

      setIndicator({
        left: linkRect.left - navRect.left,
        width: linkRect.width,
        visible: true,
      });
    };

    updateIndicator();

    const observer = new ResizeObserver(updateIndicator);
    observer.observe(nav);

    window.addEventListener("resize", updateIndicator);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateIndicator);
    };
  }, [pathname]);

  // Close mobile menu after navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="juno-header px-5 sm:px-10">
      <nav
        className="screen-max-width flex min-h-[72px] items-center justify-between"
        aria-label="Main navigation"
      >
        {/* JUNO.1 wordmark */}
        <Link to="/" className="relative z-10 text-xl" aria-label="JUNO.1 home">
          <Wordmark />
        </Link>

        {/* Desktop liquid glass navigation */}
<ul
  ref={navRef}
  className={`liquid-nav hidden sm:flex ${
    showPill ? "glass-visible" : "glass-hidden"
  }`}
>
          {/* Sliding glass indicator */}

{/* Sliding glass indicator */}
<span
  className="liquid-indicator"
  style={{
    left: indicator.left,
    width: indicator.width,
    opacity: showPill && indicator.visible ? 1 : 0,
  }}
  aria-hidden="true"
>
  <span className="liquid-reflection" />
  <span className="liquid-sparkle" />
</span>


          {navItems.map((item) => (
            <li key={item.label} className="relative list-none">
              {item.external ? (
                <a
                  href={item.to}
                  target={item.to.startsWith("http") ? "_blank" : undefined}
                  rel={
                    item.to.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className={`${linkBase} text-white/70 hover:text-white`}
                >
                  {item.label}
                </a>
              ) : (

<NavLink
  to={item.to}
  end={item.to === "/"}
  onClick={() => setShowPill(true)}
  className={({ isActive }) =>
    `${linkBase} border ${
      isActive
        ? "border-white/50 text-white"
        : "border-transparent text-white/70 hover:border-white/20 hover:text-white"
    }`
  }
>
  {item.label}
</NavLink>

              )}
            </li>
          ))}
        </ul>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="rounded-full p-2 text-white transition-colors hover:bg-white/10 sm:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile navigation */}
      {open && (
        <ul
          id="mobile-menu"
          className="mobile-glass-menu flex flex-col gap-1 pb-4 pt-2 sm:hidden"
        >
          {navItems.map((item) => (
            <li key={item.label} className="list-none">
              {item.external ? (
                <a
                  href={item.to}
                  target={item.to.startsWith("http") ? "_blank" : undefined}
                  rel={
                    item.to.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="block rounded-xl px-4 py-3 text-lg text-white/75 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {item.label}
                </a>
              ) : (
                <NavLink
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `block rounded-xl px-4 py-3 text-lg transition-colors ${
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-white/75 hover:bg-white/5 hover:text-white"
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