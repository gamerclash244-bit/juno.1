/**
 * Images for the home page. Drop your files into /public/images and edit the lists below.
 * Until a file exists, a tinted placeholder is shown in its place.
 */

export interface ColourOption {
  name: string;
  /** Swatch dot colour (also tints the placeholder). */
  swatch: string;
  /** Path under /public. Transparent PNG or WebP of the JUNO.1 works best. */
  src: string;
}

/** Slide 1 of the viewer: JUNO.1 in each colour, cross-fading automatically. Rename / add / remove freely. */
export const COLOURS: ColourOption[] = [
  { name: "Matte Black", swatch: "#1c1c1f", src: "/images/colours/black.png" },
  { name: "Matte Ice Blue", swatch: "#a9cfdd", src: "/images/colours/ice-blue.png" },
  { name: "Matte Red", swatch: "#c4222d", src: "/images/colours/red.png" },
];

export interface GalleryImage {
  title: string;
  alt: string;
  src: string;
}

/** Slides 2 onwards. Leave empty ([]) for a viewer with only the colours slide. */
export const GALLERY: GalleryImage[] = [
  { title: "Front", alt: "JUNO.1 from the front", src: "/images/gallery/front.jpg" },
  { title: "Ports", alt: "The four ports on JUNO.1", src: "/images/gallery/ports.jpg" },
  { title: "On stage", alt: "JUNO.1 on a stage rig", src: "/images/gallery/stage.jpg" },
];

/** Close-up used by the specification section (a large photo; the page pans and zooms across it). */
export const DETAIL_IMAGE = "/images/detail/closeup.jpg";

/**
 * Video behind the home page's first section. Put your file in /public/videos.
 * It plays once, muted; at 45% the page text eases in over the remaining footage.
 * Tips: 1920x1080 or wider, under ~8 MB.
 * Sources are tried in order; MP4 (H.264) works everywhere, WebM is an optional smaller extra.
 */
export const HERO_VIDEO = {
  sources: [
    { src: "/videos/hero.mp4", type: "video/mp4" },
    { src: "/videos/hero.webm", type: "video/webm" },
  ],
  /** Shown while the video loads, and to visitors who prefer reduced motion. */
  poster: "/videos/hero-poster.jpg",
};

/**
 * Photo of JUNO.1 that dissolves in over the middle of the big JUNO.1 title after the intro video.
 * Use a transparent PNG/WebP (the unit cut out, any aspect ratio, ~1600 px wide). Drop it in /public/images/hero.
 * The photo is fitted inside a box centred on the title:
 *   heightPct   box height as % of the title's height (190 = a little taller than the letters)
 *   maxWidthPct box width as % of the title's width (smaller keeps more of the letters visible)
 */
export const HERO_PHOTO = {
  src: "/images/hero/juno.png",
  heightPct: 190,
  widthPct: 42,
};
