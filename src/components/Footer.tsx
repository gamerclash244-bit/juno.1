
import { Link } from "react-router-dom";
import Wordmark from "./Wordmark";
import { SITE, mailto } from "../constants/site";

/** Site footer: brand blurb, page links, support email, and the copyright line. */
function Footer(): React.ReactElement {
  return (
    <footer className="border-t border-line px-5 pb-8 pt-14 sm:px-10">
      <div className="screen-max-width">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]" data-stagger>
          {/* Brand */}
          <div>
            <Link
              to="/"
              className="text-2xl"
              aria-label="JUNO.1 home"
            >
              <Wordmark />
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray">
              {SITE.tagline}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h2 className="text-sm font-semibold text-white">
              Explore
            </h2>

            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-gray-100 hover:text-white"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  to="/about"
                  className="text-gray-100 hover:text-white"
                >
                  About JUNO.1
                </Link>
              </li>

              <li>
                <Link
                  to="/firmware"
                  className="text-gray-100 hover:text-white"
                >
                  Firmware download
                </Link>
              </li>

              <li>
                <Link to="/buy" className="text-gray-100 hover:text-white">
                  Buy JUNO.1
                </Link>
              </li>

            </ul>
          </div>

          {/* Contact */}
          <div>
            <h2 className="text-sm font-semibold text-white">
              Contact
            </h2>

            <p className="mt-4 text-sm text-gray">
              Questions or support requests:
            </p>

            <div className="mt-2 flex flex-col items-start gap-3">
              {/* Email support */}
              <a
                href={mailto("JUNO.1 support")}
                className="break-all text-sm text-cap hover:underline"
              >
                {SITE.email}
              </a>

              {/* WhatsApp support */}
              <a
                href="https://wa.me/8848143382?text=Hi%2C%20I%20need%20help%20with%20JUNO.1"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-cap hover:underline"
              >
                Contact JUNO Support Through WhatsApp →
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-line pt-6" data-reveal="fade">
          <p className="text-xs text-gray">
            &copy; {new Date().getFullYear()} {SITE.owner}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
