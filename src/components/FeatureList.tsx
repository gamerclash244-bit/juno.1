import { features } from "../constants/site";

/** "Explore the full story": a plain list of what JUNO.1 offers, one row per feature. */
function FeatureList(): React.ReactElement {
  return (
    <section className="common-padding" aria-labelledby="features-heading">
      <div className="screen-max-width">
        <h2 id="features-heading" className="section-heading">
          Explore the full story.
        </h2>

        <ul className="mt-14 border-b border-line">
          {features.map((f) => (
            <li
              key={f.title}
              className="grid gap-3 border-t border-line py-8 md:grid-cols-[1fr_1.1fr] md:gap-10"
            >
              <h3 className="font-display text-xl font-medium tracking-tight sm:text-2xl">
                {f.title}
              </h3>
              <p className="max-w-[52ch] text-lg leading-relaxed text-gray-100">{f.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default FeatureList;
