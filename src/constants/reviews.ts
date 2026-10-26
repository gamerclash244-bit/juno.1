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
      "The single footswitch changed how I run a set. I can restart a sequence between songs without looking down at anything.",
    name: "Rahul M.",
    detail: "Live performer, Kochi",
  },
  {
    quote:
      "Setup took under a minute. Cable in, footswitch in, and it just worked with my MPC for the whole show.",
    name: "Anjali S.",
    detail: "Wedding band, Thrissur",
  },
  {
    quote:
      "Timing used to be the thing I worried about most on stage. Now the recovery is quick enough that nobody in the room notices.",
    name: "Vishnu P.",
    detail: "Playback engineer",
  },
  {
    quote:
      "Small enough to sit on my pedalboard without taking over, and the ports are easy to find in the dark.",
    name: "Fahad K.",
    detail: "Guitarist and playback, Kozhikode",
  },
  {
    quote:
      "The firmware update was two clicks and it fixed the delay I was fighting with. Good to see a product that keeps improving.",
    name: "Nithin R.",
    detail: "JUNO.1 owner since 2025",
  },
  {
    quote:
      "I perform with singers, so the sync workflow matters. This made the whole set feel calmer to run.",
    name: "Sneha T.",
    detail: "Music director, Kannur",
  },
];
