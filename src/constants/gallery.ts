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
  { name: "Black", swatch: "#1a1a1d", src: "/images/colours/black.png" },
  { name: "White", swatch: "#e8e8e4", src: "/images/colours/white.png" },
  { name: "Red", swatch: "#c4222d", src: "/images/colours/red.png" },
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
 * Tips: 1920x1080 or wider, 8-20 seconds, no sound needed (it plays muted), under ~8 MB.
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
