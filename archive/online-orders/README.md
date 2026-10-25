# Online orders (archived)

The site now takes orders through WhatsApp only. The full online-checkout build
(login, delivery form, Razorpay payment, order tracking) is kept here in case you
want it back. It is not part of the app and is not compiled.

To restore: copy `src/*` back into the project's `src`, re-add the `/buy`, `/orders`
and `/orders/:id` routes and the `AuthProvider` in `App.tsx`, run
`npm install @supabase/supabase-js`, and follow `supabase/` + `.env.example`.
