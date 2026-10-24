import { Link } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle";

function NotFound(): React.ReactElement {
  usePageTitle("Page not found");

  return (
    <section className="flex min-h-[60vh] items-center px-5 py-20 sm:px-10">
      <div className="screen-max-width">
        <h1 className="page-title" data-split>Page not found</h1>
        <p className="prose-juno mt-6" data-reveal>
          That address doesn&apos;t match any page on this site. Try the home page or the firmware
          download page.
        </p>
        <div className="mt-8 flex flex-wrap gap-3" data-stagger>
          <Link to="/" className="btn">
            Go to home
          </Link>
          <Link to="/firmware" className="btn-ghost">
            Firmware download
          </Link>
        </div>
      </div>
    </section>
  );
}

export default NotFound;
