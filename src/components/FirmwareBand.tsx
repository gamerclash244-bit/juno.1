import { Link } from "react-router-dom";
import { firmwareReleases } from "../constants/firmware";

/** Home-page call-out that leads to the firmware download page. */
function FirmwareBand(): React.ReactElement {
  const latest = firmwareReleases[0];

  return (
    <section className="common-padding bg-surface">
      <div className="screen-max-width flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="section-heading max-w-[18ch]" data-split>Keep JUNO.1 up to date.</h2>
          <p className="prose-juno mt-5" data-reveal>
            Download the latest firmware{latest ? ` (version ${latest.version})` : ""} and read what
            changed in each release.
          </p>
        </div>
        <Link to="/firmware" className="btn shrink-0 self-start md:self-auto" data-reveal>
          Go to firmware
        </Link>
      </div>
    </section>
  );
}

export default FirmwareBand;
