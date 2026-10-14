# JUNO.1 website

Product website for **JUNO.1** by NIZAL DHANI PT. Built with React, Vite, TypeScript, Tailwind CSS, Three.js (react-three-fiber) and GSAP.

## Pages
- `/` Home: animated wordmark, interactive 3D model (Full view / Close-up), features, firmware call-out
- `/about` About JUNO.1
- `/firmware` Firmware update download
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
