interface WordmarkProps {
  className?: string;
}

/**
 * "JUNO.1" with the full stop drawn as a cream disc, echoing the knob caps on the product.
 * Letters and dot carry classes (wm-letter / wm-dot) so the hero can animate them.
 */
function Wordmark({ className = "" }: WordmarkProps): React.ReactElement {
  return (
    <span
      className={`inline-flex items-baseline font-display font-semibold ${className}`}
      role="img"
      aria-label="JUNO.1"
    >
      {["J", "U", "N", "O"].map((ch) => (
        <span key={ch} className="wm-letter inline-block" aria-hidden>
          {ch}
        </span>
      ))}
      <span
        className="wm-dot inline-block rounded-full bg-cap"
        style={{ width: "0.17em", height: "0.17em", margin: "0 0.07em 0 0.05em" }}
        aria-hidden
      />
      <span className="wm-letter inline-block" aria-hidden>
        1
      </span>
    </span>
  );
}

export default Wordmark;
