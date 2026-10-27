import { ArrowUpRight } from "lucide-react";

/** Invitation to send a review through the Google Form. Uses the site's own water-fill button. */
function ReviewButton(): React.ReactElement {
  return (
    <div className="flex flex-col items-center gap-5 px-5 pb-10 text-center sm:px-10">
      <p className="text-base text-gray-100">Your review will be added soon</p>
      <a
        href="https://docs.google.com/forms/d/e/1FAIpQLScXYpin64pk8MzVYDL4QAfwStuOsHCbeRcLsAPH7Cr6K59hTQ/viewform?usp=publish-editor"
        target="_blank"
        rel="noopener noreferrer"
        className="btn"
      >
        Add your review
        <ArrowUpRight size={18} aria-hidden />
      </a>
    </div>
  );
}

export default ReviewButton;
