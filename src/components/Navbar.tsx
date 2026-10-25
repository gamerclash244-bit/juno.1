import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Wordmark from "./Wordmark";
import { navItems } from "../constants/site";

const links = navItems.filter((i) => i.to !== "/buy");
const buy = navItems.find((i) => i.to === "/buy");

/**
 * Flat, translucent top bar (apple.com style): wordmark left, small links centred, Buy on the right.
 * On phones the links open as a full-width list of large links under the bar.
 */
function Navbar(): React.ReactElement {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  // Close the menu after navigating
  useEffect(() => setOpen(false), [pathname]);

  // Stop the page scrolling behind the open menu
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="juno-header px-5 sm:px-10" data-open={open}>
      <nav
        className="screen-max-width flex h-12 items-center justify-between sm:grid sm:grid-cols-[1fr_auto_1fr]"
        aria-label="Main navigation"
      >
        <Link to="/" className="text-lg" aria-label="JUNO.1 home">
          <Wordmark />
        </Link>

        <ul className="hidden items-center gap-8 sm:flex">
          {links.map((item) => (
            <li key={item.label} className="list-none">
              <NavLink to={item.to} end={item.to === "/"} className="nav-link">
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-end gap-3">
          {buy && (
            <Link
              to={buy.to}
              className="hidden rounded-full bg-cap px-3.5 py-1 text-xs font-semibold text-black transition-opacity hover:opacity-85 sm:inline-block"
            >
              {buy.label}
            </Link>
          )}
          <button
            type="button"
            className="-mr-2 flex h-10 w-10 items-center justify-center rounded-full text-white sm:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {open && (
        <ul id="mobile-menu" className="h-[calc(100dvh-48px)] overflow-y-auto pb-10 pt-4 sm:hidden">
          {navItems.map((item, i) => (
            <li key={item.label} className="menu-item list-none" style={{ animationDelay: `${i * 55}ms` }}>
              <NavLink
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `block border-b border-white/10 py-4 font-display text-3xl font-medium tracking-tight ${
                    isActive ? "text-white" : "text-white/60"
                  }`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}

export default Navbar;
