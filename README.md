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

## Buying, login and payments

The shop runs in **demo mode** until you connect a backend: accounts and orders are stored in the browser and the payment window is a test. To take real payments use Supabase (login + database + server functions) and Razorpay (UPI, cards, net banking).

1. **Supabase project**: create one, then run `supabase/schema.sql` in the SQL editor.
2. **Razorpay**: create an account and get a Key ID and Key Secret (test keys first).
3. **Set function secrets** (Supabase dashboard, or `supabase secrets set`):
   `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `JUNO_PRICE_PAISE` (e.g. 499900 for ₹4,999), `JUNO_SHIPPING_PAISE`.
4. **Deploy the functions**:
   ```bash
   supabase functions deploy create-order
   supabase functions deploy verify-payment
   supabase functions deploy razorpay-webhook --no-verify-jwt
   ```
5. **Razorpay webhook**: point it at `https://<project>.supabase.co/functions/v1/razorpay-webhook`, events `payment.captured`, `order.paid`, `payment.failed`, using the same secret as `RAZORPAY_WEBHOOK_SECRET`.
6. **Site environment** (Netlify/Vercel, or a local `.env`): copy `.env.example` and fill `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_RAZORPAY_KEY_ID`.
7. **Price**: set `pricePaise` / `shippingPaise` in `src/constants/shop.ts` to match the secrets. The placeholder is ₹4,999.

Updating an order: open the `orders` table in Supabase, change `status` (paid, packed, shipped, delivered) and optionally fill `courier` and `tracking_number`. The customer's tracking page updates and the time is stamped automatically.

## Motion

`src/hooks/useReveal.ts` drives every page. Add `data-split` (headline), `data-reveal` (block; `="line"`, `"scale"`, `"fade"`), or `data-stagger` (children in sequence) to any element. Reduced-motion users get none of it.
