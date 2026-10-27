/**
 * Reviews shown in the "What players say" band on the home page.
 *
 * These are PLACEHOLDERS — swap the quotes, names and details for real customer reviews.
 * Keep them short (roughly 20–35 words) so the cards stay the same height.
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
    name: "Abdul Rasheed PT",
    detail: "Rythm artist, Kozhikode",
  },
  {
    quote:
      "Small, simple and quick to set up. It sits on the board and does its job for the whole show.",
    name: "Razik",
    detail: "Rythm artist, Kozhikode",
  },
];
