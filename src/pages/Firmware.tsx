import { Download } from "lucide-react";
import { downloadHref, firmwareReleases, updateSteps } from "../constants/firmware";
import type { FirmwareRelease } from "../constants/firmware";
import { mailto } from "../constants/site";
import { usePageTitle } from "../hooks/usePageTitle";

/** Ice blue: this page's accent, as red is for Contact. */
const ICE = "#8fd3ff";
const iceBtn =
  "sweep inline-flex items-center justify-center gap-2 rounded-full bg-[#8fd3ff] px-6 py-3 text-base font-semibold text-black";

const formatDate = (iso: string): string =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

/** Download button, or a "being prepared" message when the file hasn't been published yet. */
function DownloadAction({ release }: { release: FirmwareRelease }): React.ReactElement {
  const href = downloadHref(release);
  if (href) {
    // GitHub release assets are served as attachments, so a plain link starts the download
    // straight away without leaving this page.
    return (
      <a href={href} download rel="noopener" className={iceBtn}>
        <Download size={18} aria-hidden />
        Download version {release.version}
      </a>
    );
  }
  return (
    <p className="max-w-[34ch] text-gray-100">
      Version {release.version} is being prepared.{" "}
      <a
        href={mailto(`JUNO.1 firmware ${release.version}`)}
        className="text-[#8fd3ff] underline-offset-4 hover:underline"
      >
        Email support
      </a>{" "}
      if you need it sooner.
    </p>
  );
}

function Firmware(): React.ReactElement {
  usePageTitle("Firmware update");
  const [latest, ...earlier] = firmwareReleases;

  return (
    <div className="relative overflow-hidden">
      {/* Ice-blue haze, the counterpart of the red on the Contact page */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[70%]"
        style={{
          background:
            "radial-gradient(ellipse 60% 55% at 50% 20%, rgba(110,190,240,0.24), rgba(40,110,170,0.12) 50%, transparent 78%)",
        }}
      />
      <div className="relative z-10">
      {/* Page header */}
      <section className="px-5 pb-12 pt-16 sm:px-10 sm:pt-24">
        <div className="screen-max-width">
          <h1 className="page-title" data-reveal>
            Firmware{" "}
            <span style={{ color: ICE, textShadow: "0 0 0.2em rgba(143,211,255,0.55)" }}>update</span>
          </h1>
          <p className="prose-juno mt-8 text-xl" data-reveal>
            Download the latest firmware for JUNO.1 and see what changed in each release.
          </p>
        </div>
      </section>

      {/* Latest release */}
      {latest && (
        <section className="px-5 pb-20 sm:px-10 sm:pb-28" aria-labelledby="latest-heading">
          <div className="screen-max-width">
            <div className="rounded-3xl border border-line bg-surface p-7 transition-colors hover:border-[#8fd3ff]/40 sm:p-10" data-reveal="scale">
              <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 id="latest-heading" className="text-gray">
                    Latest release
                  </h2>
                  <p className="mt-2 font-display text-5xl font-semibold tracking-tight sm:text-6xl">
                    v{latest.version}
                  </p>
                  <p className="mt-3 text-gray-100">
                    {formatDate(latest.date)}
                    {latest.size ? ` · ${latest.size}` : ""}
                  </p>
                </div>
                <DownloadAction release={latest} />
              </div>

              <div className="mt-10 border-t border-line pt-8">
                <h3 className="font-semibold">What&apos;s new</h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-lg text-gray-100">
                  {latest.notes.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>

                {latest.sha256 && (
                  <div className="mt-8">
                    <h3 className="font-semibold">SHA-256 checksum</h3>
                    <p className="mt-2 break-all text-sm text-gray-100 select-all">{latest.sha256}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* How to update */}
      <section className="bg-surface px-5 py-20 sm:px-10 sm:py-28" aria-labelledby="steps-heading">
        <div className="screen-max-width grid gap-10 md:grid-cols-[1fr_1.4fr] md:gap-16">
          <h2 id="steps-heading" className="section-heading" data-split>
            How to update
          </h2>
          <ol className="border-b border-line" data-stagger>
            {updateSteps.map((s, i) => (
              <li key={s.title} className="grid grid-cols-[2.5rem_1fr] gap-2 border-t border-line py-6">
                <span className="font-display text-xl text-[#8fd3ff]">{i + 1}</span>
                <div>
                  <h3 className="text-lg font-semibold">{s.title}</h3>
                  <p className="mt-1 max-w-[52ch] text-gray-100">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Earlier releases (only shown once there is more than one) */}
      {earlier.length > 0 && (
        <section className="px-5 py-20 sm:px-10 sm:py-28" aria-labelledby="history-heading">
          <div className="screen-max-width">
            <h2 id="history-heading" className="section-heading" data-split>
              Earlier releases
            </h2>
            <ul className="mt-12 border-b border-line" data-stagger>
              {earlier.map((r) => (
                <li
                  key={r.version}
                  className="flex flex-col gap-4 border-t border-line py-7 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-display text-2xl font-medium">v{r.version}</p>
                    <p className="mt-1 text-gray">
                      {formatDate(r.date)}
                      {r.size ? ` · ${r.size}` : ""}
                    </p>
                    <p className="mt-3 max-w-[56ch] text-gray-100">{r.notes.join(" ")}</p>
                  </div>
                  <DownloadAction release={r} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Help */}
      <section className="px-5 py-20 sm:px-10 sm:py-28">
        <div className="screen-max-width">
          <h2 className="section-heading" data-split>Need help updating?</h2>
          <p className="prose-juno mb-8 mt-5" data-reveal>
            Tell us which version you are installing and what you see on your JUNO.1.
          </p>
          <a href={mailto("JUNO.1 firmware help")} className={iceBtn} data-reveal>
            Email support
          </a>
        </div>
      </section>
      </div>
    </div>
  );
}

export default Firmware;
