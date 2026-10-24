/**
 * Liquid-glass refraction helpers.
 *
 * Real liquid glass bends the light that passes through its edges. We fake that with an SVG
 * displacement map: a PNG whose red/green channels say "sample the backdrop from slightly
 * to the side" for every pixel. Inside the pane the map is neutral (no bend); across a
 * rounded bezel at the rim it pushes pixels along the edge normal on a convex-lens curve,
 * so whatever scrolls behind the nav smears and magnifies at the edges like thick glass.
 */

/** Convex-lens falloff: 1 at the very edge, easing to 0 towards the flat centre. */
const lens = (t: number): number => 1 - Math.sqrt(1 - Math.min(1, Math.max(0, t)) ** 2);

export function makeDisplacementMap(width: number, height: number, bezel: number): string {
  const w = Math.max(2, Math.round(width));
  const h = Math.max(2, Math.round(height));
  const radius = h / 2; // capsule
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const img = ctx.createImageData(w, h);
  const cx = w / 2;
  const cy = h / 2;
  const hx = w / 2 - radius;
  const hy = h / 2 - radius;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const px = x + 0.5 - cx;
      const py = y + 0.5 - cy;
      // Signed distance to the rounded rectangle (negative inside).
      const qx = Math.abs(px) - hx;
      const qy = Math.abs(py) - hy;
      const ox = Math.max(qx, 0);
      const oy = Math.max(qy, 0);
      const outside = Math.hypot(ox, oy);
      const inside = Math.min(Math.max(qx, qy), 0);
      const sdf = outside + inside - radius;
      const depth = -sdf; // distance in from the rim

      let dx = 0;
      let dy = 0;
      if (depth > 0 && depth < bezel) {
        // Outward normal at this pixel.
        let nx: number;
        let ny: number;
        if (outside > 0) {
          nx = (ox / outside) * Math.sign(px);
          ny = (oy / outside) * Math.sign(py);
        } else if (qx > qy) {
          nx = Math.sign(px);
          ny = 0;
        } else {
          nx = 0;
          ny = Math.sign(py);
        }
        const strength = lens(1 - depth / bezel);
        dx = -nx * strength; // sample from further inside the pane
        dy = -ny * strength;
      }

      const i = (y * w + x) * 4;
      img.data[i] = 128 + dx * 127;
      img.data[i + 1] = 128 + dy * 127;
      img.data[i + 2] = 128;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL("image/png");
}

/** Only Chromium renders SVG filters inside backdrop-filter; everyone else gets the blur fallback. */
export function supportsRefraction(): boolean {
  if (typeof navigator === "undefined") return false;
  const brands = (navigator as Navigator & { userAgentData?: { brands: { brand: string }[] } })
    .userAgentData?.brands;
  return !!brands?.some((b) => /Chromium/i.test(b.brand));
}
