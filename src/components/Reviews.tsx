import { REVIEWS } from "../constants/reviews";
import type { Review } from "../constants/reviews";

const initials = (name: string): string =>
  name
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

function ReviewCard({ review }: { review: Review }): React.ReactElement {
  return (
    <figure className="review-card w-[270px] shrink-0 rounded-3xl border border-line bg-surface p-6 sm:w-[330px] sm:p-7">
      <blockquote className="text-base leading-relaxed text-gray-100 sm:text-lg">
        &ldquo;{review.quote}&rdquo;
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cap text-xs font-semibold text-black">
          {initials(review.name)}
        </span>
        <span>
          <span className="block text-sm font-semibold text-white">{review.name}</span>
          <span className="block text-xs text-gray">{review.detail}</span>
        </span>
      </figcaption>
    </figure>
  );
}

/**
 * "What players say": a strip of reviews that drifts sideways on its own.
 * Hovering or focusing it pauses the drift; reduced-motion visitors get a strip they
 * can swipe or scroll instead. The list is rendered twice so the loop has no seam.
 */
function Reviews(): React.ReactElement {
  return (
    <section className="overflow-hidden py-20 sm:py-28" aria-labelledby="reviews-heading">
      <div className="screen-max-width px-5 sm:px-10">
        <h2 id="reviews-heading" className="section-heading">
          What players say.
        </h2>
        <p className="prose-juno mt-5">Notes from musicians running JUNO.1 on stage.</p>
      </div>

      <div
        className="reviews-viewport mt-12"
        role="region"
        aria-label="Customer reviews"
        tabIndex={0}
      >
        <div className="reviews-track">
          {/* Four copies keep the drift seamless even with a short list: the loop shifts by exactly two. */}
          {[0, 1, 2, 3].map((copy) => (
            <div key={copy} className="reviews-group" aria-hidden={copy > 0 ? true : undefined}>
              {REVIEWS.map((review) => (
                <ReviewCard key={`${copy}-${review.name}`} review={review} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Reviews;
