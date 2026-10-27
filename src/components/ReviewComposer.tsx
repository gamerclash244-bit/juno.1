import { useId, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { REVIEW_FORM } from "../constants/reviews";

type Status = "idle" | "sending" | "sent" | "error";

interface Draft {
  name: string;
  city: string;
  role: string;
  review: string;
}

const EMPTY: Draft = { name: "", city: "", role: "", review: "" };

const inputClass =
  "mt-2 w-full rounded-2xl border border-line bg-black/60 px-4 py-3 text-base text-white placeholder:text-white/35 transition focus:border-cap/60 focus:outline-none";

/** The form takes one answer, so the details are labelled inside the message. */
function asMessage(draft: Draft): string {
  const lines = [`Name: ${draft.name.trim()}`];
  if (draft.city.trim()) lines.push(`City: ${draft.city.trim()}`);
  if (draft.role.trim()) lines.push(`Plays: ${draft.role.trim()}`);
  lines.push("", draft.review.trim());
  return lines.join("\n");
}

async function send(draft: Draft): Promise<boolean> {
  const body = new URLSearchParams();
  body.set(REVIEW_FORM.reviewField, asMessage(draft));
  try {
    // The form is on another origin and answers opaquely, so "sent" means the request left
    // the browser — the review then shows up in the form's responses.
    await fetch(REVIEW_FORM.action, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: body.toString(),
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * "Add your review": the writer lives on the page. A visitor types the review here and it is
 * posted straight to the JUNO.1 review form, so nothing opens in a new tab and nobody has to
 * leave the site.
 */
function ReviewComposer(): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const id = useId();

  const change =
    (key: keyof Draft) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
      setDraft((d) => ({ ...d, [key]: e.target.value }));
    };

  const submit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (status === "sending") return;

    // Hidden field: only bots fill it in, and they get a silent "thanks".
    if (String(new FormData(e.currentTarget).get("company") ?? "").trim()) {
      setDraft(EMPTY);
      setOpen(false);
      setStatus("sent");
      return;
    }

    if (draft.name.trim().length < 2) {
      setError("Please add your name.");
      return;
    }
    if (draft.review.trim().length < 10) {
      setError("Please write a little more about JUNO.1.");
      return;
    }

    setError("");
    setStatus("sending");
    const ok = await send(draft);
    if (ok) {
      setDraft(EMPTY);
      setOpen(false);
      setStatus("sent");
    } else {
      setStatus("error");
    }
  };

  return (
    <div className="px-5 pb-16 text-center sm:px-10 sm:pb-20">
      <p className="text-base text-gray-100" role="status">
        {status === "sent" ? "Thank you — your review has been sent." : "Your review will be added soon"}
      </p>

      <div className="mt-5 flex justify-center">
        <button
          type="button"
          className="btn"
          aria-expanded={open}
          aria-controls={`${id}-form`}
          onClick={() => {
            setError("");
            setStatus((s) => (s === "sent" ? "idle" : s));
            setOpen((v) => !v);
          }}
        >
          {open ? "Close" : "Add your review"}
          {!open && <ArrowUpRight size={18} aria-hidden />}
        </button>
      </div>

      {open && (
        <form
          id={`${id}-form`}
          onSubmit={submit}
          noValidate
          className="pop-in mx-auto mt-8 max-w-xl rounded-3xl border border-line bg-surface p-6 text-left sm:p-7"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs uppercase tracking-[0.18em] text-gray">Your name</span>
              <input
                className={inputClass}
                value={draft.name}
                onChange={change("name")}
                autoComplete="name"
                placeholder="Moideen"
                maxLength={80}
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-[0.18em] text-gray">City</span>
              <input
                className={inputClass}
                value={draft.city}
                onChange={change("city")}
                placeholder="Kozhikode"
                maxLength={60}
              />
            </label>
          </div>

          <label className="mt-4 block">
            <span className="text-xs uppercase tracking-[0.18em] text-gray">What you play</span>
            <input
              className={inputClass}
              value={draft.role}
              onChange={change("role")}
              placeholder="Rythm artist"
              maxLength={60}
            />
          </label>

          <label className="mt-4 block">
            <span className="text-xs uppercase tracking-[0.18em] text-gray">Your review</span>
            <textarea
              className={inputClass}
              value={draft.review}
              onChange={change("review")}
              rows={5}
              maxLength={REVIEW_FORM.maxLength}
              placeholder="How does JUNO.1 fit into your set?"
            />
          </label>

          {/* Only bots fill this in. */}
          <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

          {error && (
            <p role="alert" className="mt-4 text-sm text-red-300">
              {error}
            </p>
          )}
          {status === "error" && (
            <p role="alert" className="mt-4 text-sm text-red-300">
              Could not send just now. Please try again.
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button type="submit" className="btn" disabled={status === "sending"}>
              {status === "sending" ? "Sending…" : "Send review"}
            </button>
            <span className="text-xs text-gray">No sign-in, no redirect — it goes straight to the review form.</span>
          </div>
        </form>
      )}
    </div>
  );
}

export default ReviewComposer;
