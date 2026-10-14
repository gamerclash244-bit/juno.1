import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { SITE, mailto } from "../constants/site";

/** Support email as a mailto link plus a copy button that confirms when copied. */
function CopyEmail(): React.ReactElement {
  const [copied, setCopied] = useState(false);

  const copy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(SITE.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the mailto link above still works
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <a
        href={mailto("JUNO.1 support")}
        className="break-all font-display text-xl font-medium text-cap hover:underline sm:text-3xl"
      >
        {SITE.email}
      </a>
      <button
        type="button"
        onClick={copy}
        className="btn-ghost !px-4 !py-2 text-sm"
        aria-live="polite"
      >
        {copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
        {copied ? "Copied" : "Copy email"}
      </button>
    </div>
  );
}

export default CopyEmail;
