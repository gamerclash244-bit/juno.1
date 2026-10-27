/**
 * Reviews shown in the "What players say" band on the home page.
 *
 * The names are real; the wording under them is still placeholder copy — replace each quote
 * with what the artist actually said, as it comes in. Keep them short (roughly 20–35 words)
 * so the cards stay the same height.
 */
export interface Review {
  quote: string;
  name: string;
  /** Location, role or the setup they play with. */
  detail: string;
}

export const REVIEWS: Review[] = [
  {
    quote:
      "The restart between songs is the part I use most. One tap and the set is running again, without looking down.",
    name: "Moideen",
    detail: "Rythm artist, Kozhikode",
  },
  {
    quote:
      "Small, simple and quick to set up. It sits on the board and does its job for the whole show.",
    name: "Razik",
    detail: "Rythm artist, Kozhikode",
  },
];

/**
 * Where the composer under the band sends what a visitor writes.
 *
 * It posts to the JUNO.1 review form's own response endpoint, so the message arrives in the
 * same form responses as before and nobody has to open Google or leave the site. Google does
 * not let another origin read that response, so the page confirms once the request has left
 * the browser.
 *
 * The form has one question today ("review"), so `reviewField` carries the whole message —
 * name, city, role and the review text, each labelled. If you add questions to the form, add
 * their `entry.<id>` values here and the composer can send them as separate answers.
 */
export const REVIEW_FORM = {
  action:
    "https://docs.google.com/forms/d/e/1FAIpQLScXYpin64pk8MzVYDL4QAfwStuOsHCbeRcLsAPH7Cr6K59hTQ/formResponse",
  reviewField: "entry.893130546",
  /** Longest review the writer accepts. */
  maxLength: 600,
} as const;
