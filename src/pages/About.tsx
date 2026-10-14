import { Link } from "react-router-dom";
import CopyEmail from "../components/CopyEmail";
import { SITE, principles, specs } from "../constants/site";
import { usePageTitle } from "../hooks/usePageTitle";

function About(): React.ReactElement {
  usePageTitle("About");

  return (
    <>
      {/* Page header */}
      <section className="px-5 pb-16 pt-16 sm:px-10 sm:pb-24 sm:pt-24">
        <div className="screen-max-width">
          <h1 className="page-title">About JUNO.1</h1>
          <p className="prose-juno mt-8 text-xl">
            JUNO.1 is a compact hardware unit designed and published by {SITE.owner}. It is built for
             musicians who demand seamless control and reliable performance. Designed to simplify live music workflows, it brings responsive control, intuitive operation, and smoother transitions to the stage.
          </p>
        </div>
      </section>

      {/* What it is */}
      <section className="bg-surface px-5 py-20 sm:px-10 sm:py-28">
        <div className="screen-max-width grid gap-8 md:grid-cols-[1fr_1.4fr] md:gap-16">
          <h2 className="section-heading">What JUNO.1 is</h2>
          <div className="space-y-6">
            <p className="prose-juno">
              JUNO.1 is a performance-focused music device designed to make live performance 
              smoother, simpler, and more reliable. Created with musicians in mind, it focuses on intuitive control, responsive operation, and a seamless START/STOP workflow that keeps performers connected to their music.
            </p>
            <p className="prose-juno">
              The ports sit together on one side so that makes each one easy to see, so setting up JUNO.1 is quick and straightforward.

              With features such as single-footswitch control and improved START/STOP, 
              JUNO.1 helps musicians handle timing adjustments and manage their performance without 
              unnecessary interruptions. Every improvement is designed to reduce complexity on stage, allowing performers to focus less on operating equipment and more on delivering their music.
            </p>
            <p className="prose-juno">
              Because the firmware can be updated, JUNO.1 does not stay frozen at the version it
              shipped with. New releases are published on the{" "}
              <Link to="/firmware" className="text-cap underline-offset-4 hover:underline">
                firmware page
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="px-5 py-20 sm:px-10 sm:py-28" aria-labelledby="principles-heading">
        <div className="screen-max-width">
          <h2 id="principles-heading" className="section-heading">
            How it&apos;s designed
          </h2>
          <ul className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
            {principles.map((p) => (
              <li key={p.title} className="border-t border-line pt-6">
                <h3 className="font-display text-xl font-medium tracking-tight">{p.title}</h3>
                <p className="mt-3 text-lg leading-relaxed text-gray-100">{p.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Specs */}
      <section className="bg-surface px-5 py-20 sm:px-10 sm:py-28" aria-labelledby="specs-heading">
        <div className="screen-max-width grid gap-8 md:grid-cols-[1fr_1.4fr] md:gap-16">
          <h2 id="specs-heading" className="section-heading">
            At a glance
          </h2>
          <dl className="border-b border-line">
            {specs.map((s) => (
              <div
                key={s.label}
                className="grid gap-1 border-t border-line py-5 sm:grid-cols-[10rem_1fr] sm:gap-6"
              >
                <dt className="text-gray">{s.label}</dt>
                <dd className="break-words text-white">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Contact */}
      <section className="px-5 py-20 sm:px-10 sm:py-28" aria-labelledby="contact-heading">
        <div className="screen-max-width">
          <h2 id="contact-heading" className="section-heading">
            Questions about JUNO.1?
          </h2>
          <p className="prose-juno mb-8 mt-5">
            Email us for support, firmware help or general questions.
          </p>
          <CopyEmail />
        </div>
      </section>
    </>
  );
}

export default About;
