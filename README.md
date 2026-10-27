# JUNO.1 website

Product website for **JUNO.1** by NIZAL DHANI PT. Built with React, Vite, TypeScript, Tailwind CSS, Three.js (react-three-fiber) and GSAP.

## Pages
- `/` Home: animated wordmark, interactive 3D model (Full view / Close-up), features, firmware call-out
- `/about` About JUNO.1
- `/firmware` Firmware update download
- `/buy` Sign in, delivery details, order summary, online payment
- `/orders` and `/orders/:id` Order history and tracking by order ID
- Contact: `support.junolive@gmail.com` (navbar, footer, About page)
- Footer: © NIZAL DHANI PT

## Run it
```bash
npm install
npm run dev      # local development
npm run build    # production build in /dist
```
Deploys as-is to Vercel or Netlify (SPA rewrites included).

## Things you should edit
- `src/constants/site.ts`: tagline, features, specs, principles. The product copy was written from the 3D model; replace it with your real details.
- `src/constants/firmware.ts`: firmware releases (version, date, notes, checksum).
- `public/models/juno1.glb`: the 3D model (compressed from your original with meshopt: 13.3 MB to 3.4 MB).

## Publishing firmware
1. Copy the file into `public/firmware/` (e.g. `JUNO1-firmware-v1.0.0.bin`).
2. In `src/constants/firmware.ts` set the matching entry's `available: true` (add `size` / `sha256` if you want them shown).
3. Add new releases at the top of the list; older ones appear under "Earlier releases".

## Credits
Layout approach adapted from an MIT-licensed iPhone showcase template (notice kept in `LICENSES/template-MIT.txt`). All Apple images, videos and the iPhone model have been removed.

## Buying

Orders are taken on WhatsApp only. `/buy` shows an "Order on WhatsApp" button that opens a message with name, quantity, colour and address ready to fill in. The earlier online-checkout build (login, Razorpay, order tracking) is kept in `archive/online-orders/` and is not part of the app.

## Home hero video

The first section of the home page is a full-screen video. Add `hero.mp4` (and optionally `hero.webm` and `hero-poster.jpg`) to `public/videos/`; see `public/videos/README.txt`. It plays once, muted, and when playback reaches 45% the JUNO.1 text, tagline and buttons ease in over the remaining footage. The corner button pauses it, and replays it once it has ended. Until the file exists an animated placeholder shows. On scroll the video shrinks into a rounded card while the text lifts away.

## Firmware downloads (GitHub Releases)

The Download button on `/firmware` downloads straight from your GitHub release. Attach the `.exe` to a GitHub release, right-click it on the release page, choose "Copy link address", and paste it into `url` for that version in `src/constants/firmware.ts`. Until a `url` is set the page shows "being prepared". GitHub turns spaces in file names into dots, so always paste the copied link rather than typing it.

## Hero photo

After the intro video, a photo of JUNO.1 pops up in the middle of the big title. Add a transparent PNG at `public/images/hero/juno.png` and tune its size with `HERO_PHOTO` in `src/constants/gallery.ts`.

## Page colours

Contact has a red haze and accents, Firmware has ice blue (`#8fd3ff`), About stays black.

## Home images

Put your pictures in `public/images/` (see `public/images/README.txt`) and edit `src/constants/gallery.ts`:

- `COLOURS`: slide 1 of the viewer, JUNO.1 in each colour, cross-fading automatically.
- `GALLERY`: the slides after it.
- `DETAIL_IMAGE`: the close-up that the pinned specification section zooms across.

Until a file exists a tinted placeholder is shown. Edit the specification stops in `src/components/SpecShowcase.tsx` (`chapters`).

## 3D model

The 3D viewer is off. Set `SHOW_3D_VIEWER = true` in `src/constants/site.ts` to show it again below the specification section.

## Reviews

`src/constants/reviews.ts` holds both the cards in the "What players say" band (`REVIEWS`) and where the writer sends what a visitor types (`REVIEW_FORM`). Under the band, "Add your review" opens a composer on the page: name, city, what they play and the review. Nothing opens in another tab; the message is posted to the JUNO.1 review form's own response endpoint, so it arrives in the same Google Form responses as before. That form has one question today, so the name, city and role are folded into the one answer with labels — add questions to the form, give each its own `entry.<id>` in `REVIEW_FORM`, and they can be sent as separate answers.

## Motion

`src/hooks/useReveal.ts` drives every page. Add `data-split` (headline), `data-reveal` (block; `="line"`, `"scale"`, `"fade"`), or `data-stagger` (children in sequence) to any element. Reduced-motion users get none of it.
