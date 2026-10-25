/**
 * Site-wide facts and copy. Edit here and every page updates.
 * NOTE: product descriptions below were written from the 3D model; replace them
 * with your real features and specs when you have them.
 */
export const SITE = {
  name: "JUNO.1",
  owner: "NIZAL DHANI PT",
  email: "support.junolive@gmail.com",
  number: "8848143382",
  whatsappDisplay: "+91 88481 43382",
  tagline: "Unleash Your Rythm.",
  modelUrl: "/models/juno1.glb",
} as const;

/**
 * The interactive 3D model on the home page is switched OFF.
 * Set to true to show it again (below the image viewer).
 */
export const SHOW_3D_VIEWER = false;

export const mailto = (subject?: string): string =>
  `mailto:${SITE.email}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;

export interface NavItem {
  label: string;
  to: string;
  /** External (mailto) links render as <a>, internal ones as router links. */
  external?: boolean;
}

export const navItems: NavItem[] = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Firmware", to: "/firmware" },
  { label: "Contact", to: "/contact" },
  { label: "Buy", to: "/buy" },
];

export interface Feature {
  title: string;
  body: string;
}

/** Rows in the "Explore the full story" list on the home page. */
export const features: Feature[] = [
  {
    title: "A compact, enclosure",
    body: "A solid, low-profile case that sits quietly in any Live Stages.",
  },
  {
    title: "Four ports",
    body: "1/4 mono jack, Used to Plug Footswitch.",
  },
  {
    title: "A 1.5(approx), Braided USB-A Cable.",
    body: "A Braided Cable Connects Your JUNO.1 To MPC.",
  },
  {
    title: "Firmware you can update",
    body: "New releases are published on this site. Download the latest file and keep your JUNO.1 current.",
  },
];

export interface Spec {
  label: string;
  value: string;
}

/** About-page spec table. Add real technical specs here as they are confirmed. */
export const specs: Spec[] = [
  { label: "Product", value: "JUNO.1" },
  { label: "Ports", value: "4 * 1/4 mono jack" },
  { label: "Cable", value: "Braided USB-A Cable" },
  { label: "Finish", value: "Black enclosure (may changes)" },
  { label: "Firmware", value: "User-updatable, downloaded from this site" },
  { label: "Support", value: SITE.email },
  { label: "For Booking through Whatsapp", value: SITE.number},
];

export interface Principle {
  title: string;
  body: string;
}

export const principles: Principle[] = [
  {
    title: "Small on purpose",
    body: "Designed with simplicity in mind, JUNO.1 keeps your START/STOP workflow clean, your control intuitive, and your focus on the music.",
  },
  {
    title: "Easy to connect",
    body: "Four clearly visible ports and one USB-A, with nothing hidden in menus.",
  },
  {
    title: "Never finished",
    body: "Firmware updates let the product improve after it ships.",
  },
];


export const contactInfo = {
  replyTime: "Usually within 24–48 hours",
  hours: "Monday–Saturday",
  languages: "English and Malayalam",
  quickReply: "Quick support for your questions",

  include: [
    "Your JUNO.1 firmware version",
    "A description of the issue",
    "Photos or screenshots, if relevant",
  ],
};

export const whatsappLink = (message?: string): string =>
  `https://wa.me/91${SITE.number}?text=${encodeURIComponent(
    message ?? "Hi, I have a question about JUNO.1"
  )}`;

  