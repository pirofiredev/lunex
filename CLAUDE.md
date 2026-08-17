# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LUNEX is a Next.js 16 (App Router) storefront for streetwear, using TypeScript, Tailwind CSS v4, Framer Motion, and Zustand. The site uses Directus CMS (hosted on Supabase) for content management, Stripe Checkout with distance-based shipping from Geneva, and order/newsletter management via Supabase.

## Development Commands

```bash
npm install              # Install dependencies
npm run dev             # Start dev server (http://localhost:3000, Turbopack)
npm run build           # Production build
npm start               # Start production server
npx eslint .            # Run linter
```

The site runs fully on placeholder data with zero env vars set — useful for reviewing design/UX before connecting any backend.

## Architecture

### Content Layer (lib/cms.ts)

All catalog reads go through `lib/cms.ts`, which fetches from Directus CMS tables in Supabase:

1. **Directus CMS on Supabase** — `products`, `stock`, and `directus_files` tables
2. **Static fallback** (`lib/data/products.ts`) — fallback if Supabase is unreachable

**Database Schema:**
- `products` — id, slug, name, category (varchar), price, description, care (JSON array), images (UUID → directus_files), drop_id, releasedate (timestamptz/timestamp, enables "NEW" badge for products released within last 30 days, excluding drops)
- `stock` — stock_id, product_id (FK), size, quantity
- `directus_files` — Directus-managed file storage (id, filename_disk, type, etc.)
- `newsletter_subscribers` — email signups
- `orders` — Stripe checkout orders

**Image Handling:**
Product images are stored in the `directus_files` table. The `products.images` field contains a UUID that references `directus_files.id`. Images are served at:
```
{NEXT_PUBLIC_SUPABASE_URL}/assets/{file_id}
```

Key functions:
- `getProducts()` — fetches all products with stock, filters unreleased drops
- `getProductBySlug(slug)` — single product lookup with stock
- `getProductsByCategory(category)` — filtered product list
- `getDrops()` — drops not yet implemented in new schema, returns static fallback
- `getUpcomingDrop()` — next unreleased drop (static fallback for now)
- `subscribeToNewsletter(email)` — writes to `newsletter_subscribers`

### Supabase Client Factories (lib/supabase.ts)

Two client types:
- `getSupabaseBrowserClient()` — uses `NEXT_PUBLIC_SUPABASE_ANON_KEY`, safe for client components, respects RLS
- `getSupabaseServiceClient()` — uses `SUPABASE_SERVICE_ROLE_KEY`, server-only, bypasses RLS

Both return `null` when env vars are missing so the UI never crashes before Supabase is configured.

**RLS configuration**: 
- `products` and `stock` need RLS enabled with public SELECT policies (see migration file below)
- `newsletter_subscribers` and `orders` must have NO public policies — they hold customer PII and are only accessed server-side with the service role key
- All `directus_*` tables should remain RLS-disabled as they're managed by Directus server-side

**To enable RLS on products and stock tables**, run this SQL in your Supabase SQL Editor:
```sql
-- Enable RLS on products and stock tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock ENABLE ROW LEVEL SECURITY;

-- Allow public read access to products
CREATE POLICY "Public read access to products"
ON products FOR SELECT
TO anon, authenticated
USING (true);

-- Allow public read access to stock
CREATE POLICY "Public read access to stock"
ON stock FOR SELECT
TO anon, authenticated
USING (true);
```

### Stripe Checkout Flow

**LUNEX uses Stripe's hosted Checkout page, not a custom payment form built in this app.** The integration:

1. User adds items to cart (`lib/store/cart.ts` — Zustand with localStorage persistence)
2. User selects country/postal code → `lib/shipping.ts` geocodes via Zippopotam.us, calculates distance from Geneva, returns tiered rate
3. Cart page or drawer calls `/api/checkout` with `lines` + `shipping` → creates Checkout Session, locks `shipping_address_collection.allowed_countries` to the quoted country, adds shipping as a line item → returns `session.url`
4. Browser redirects to `session.url` (Stripe's domain) — card entry, address form, and pay button all live there
5. On payment, Stripe redirects back to `/checkout/success` and fires `checkout.session.completed` webhook
6. Webhook handler (`/api/webhooks/stripe`) verifies signature, fetches full session with line items expanded, writes order to Supabase `orders` table, sends emails via Resend (if configured)

**Stock validation**: `/api/checkout` checks `products.stock[size]` against cart quantities before creating the session. If any item is out of stock, checkout is rejected with a 400 error.

### Shipping Calculator (lib/shipping.ts)

Distance-based pricing from Geneva (46.2044, 6.1432):
- Geocodes postal code via Zippopotam.us (free, no API key)
- Calculates haversine distance
- Maps to tiered rates: ≤60km → 6 CHF, ≤150km → 9 CHF, ≤350km → 13 CHF, ≤700km → 18 CHF, >700km → 24 CHF
- Falls back to flat country rates if geocoding fails (`COUNTRY_FALLBACK_CHF`)

Supported countries: CH, FR, DE, IT, AT

### Order Emails (lib/email.ts)

Uses Resend API when `RESEND_API_KEY` is set:
- `sendOrderNotificationEmail()` — sends "ship this" alert to `ORDER_NOTIFICATION_EMAIL`
- `sendOrderConfirmationEmail()` — sends receipt to customer

Both are safe no-ops if Resend isn't configured. `RESEND_FROM_EMAIL` defaults to `onboarding@resend.dev` (test-only, rate-limited) — verify your own domain in Resend for production.

## Key Files

- `app/globals.css` — design tokens in `@theme` block: #000000, #0D01DD (blue accent), #FFFFFF, #1A1A1A
- `components/ProductVisual.tsx` — procedural SVG line art standing in for real product photography
- `lib/types.ts` — shared TypeScript types (`Product`, `Drop`, `CartLine`, etc.)
- `lib/time.ts` — countdown timer utilities for upcoming drops

## Environment Variables

Required for Stripe:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET` (get from `stripe listen --forward-to localhost:3000/api/webhooks/stripe`)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

Required for Supabase:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional (order emails):
- `RESEND_API_KEY`
- `ORDER_NOTIFICATION_EMAIL` (where "ship this" alerts go)
- `RESEND_FROM_EMAIL` (defaults to `onboarding@resend.dev`)

## Testing Stripe Webhooks Locally

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Copy the whsec_... value into STRIPE_WEBHOOK_SECRET in .env.local
npm run dev
# Test purchase with card 4242 4242 4242 4242, any future expiry, any CVC
```

## Design System

- **Typography**: Bebas Neue (headings), Inter (body) — self-hosted via `@fontsource`, no external font fetch
- **Colors**: Black (#000000), electric blue (#0D01DD), white (#FFFFFF), dark grey (#1A1A1A)
- **Animations**: Framer Motion — hero sequencing, scroll reveals (`components/RevealOnScroll.tsx`), cart drawer transitions
- **Responsive**: Mobile-first, dark mode only, visible keyboard focus, `prefers-reduced-motion` respected throughout

## Adding Content Sources

### Supabase

Run the schema (SQL comments at the bottom of `lib/supabase.ts`) in the Supabase SQL editor. Enable RLS on all tables: add a public SELECT policy for `products` and `drops`, NO public policies for `orders` and `newsletter_subscribers`.

## Route Structure

- `/` — homepage with hero, featured products, newsletter popup
- `/collection` — full catalog with category filter
- `/product/[slug]` — product detail page
- `/drops` — upcoming/past drops index
- `/drops/[slug]` — single drop detail with countdown timer
- `/about` — brand story
- `/cart` — full cart page with shipping estimator
- `/checkout/success` — post-payment confirmation
- `/api/checkout` — POST endpoint to create Stripe Checkout Session
- `/api/shipping-estimate` — POST endpoint for shipping calculator
- `/api/webhooks/stripe` — Stripe webhook handler

## Notes

- Product imagery is procedural SVG (`components/ProductVisual.tsx`). Swap `Product.images` for real photo URLs once photography is ready.
- Cart state persists in localStorage via Zustand (`lib/store/cart.ts`).
- The shipping estimator geocodes postal codes at request time — responses are cached for 24 hours (`next: { revalidate: 86400 }`).
- All monetary amounts are stored/calculated in CHF (Swiss Francs).
