# LUNEX

Modern streetwear storefront built with Next.js 16, featuring distance-based shipping from Geneva, Stripe Checkout integration, and Directus CMS on Supabase.

## Features

- **Next.js 16 App Router** with TypeScript and Turbopack
- **Directus CMS** hosted on Supabase for content management
- **Stripe Checkout** with hosted payment pages
- **Distance-based shipping** calculated from Geneva using postal code geocoding
- **Real-time stock validation** before checkout
- **Order notifications** via Resend email
- **Cart persistence** with Zustand and localStorage
- **Dark mode design** with Tailwind CSS v4
- **Smooth animations** with Framer Motion

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **CMS**: Directus (Supabase-hosted)
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe Checkout
- **Email**: Resend
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Fonts**: Bebas Neue (headings), Inter (body)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Stripe account
- Supabase project
- (Optional) Resend account for order emails

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd lunex
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials (see [Environment Variables](#environment-variables) below).

4. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Note**: The site runs fully on placeholder data with zero env vars set — useful for reviewing design/UX before connecting any backend.

## Environment Variables

### Required for Stripe

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Get your API keys from [Stripe Dashboard](https://dashboard.stripe.com/apikeys).

### Required for Supabase

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

Get these from your Supabase project settings.

### Optional (Email Notifications)

```env
RESEND_API_KEY=re_...
ORDER_NOTIFICATION_EMAIL=orders@yourdomain.com
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

Get your API key from [Resend](https://resend.com/api-keys).

## Database Setup

### Supabase Schema

All catalog reads go through `lib/cms.ts`, which fetches from Directus CMS tables in Supabase:

- `products` — id, slug, name, category, price, description, care, images (UUID → directus_files), drop_id
- `stock` — stock_id, product_id (FK), size, quantity
- `directus_files` — Directus-managed file storage
- `newsletter_subscribers` — email signups
- `orders` — Stripe checkout orders

### Enable Row Level Security

Run this SQL in your Supabase SQL Editor:

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

**Important**: 
- `products` and `stock` need public SELECT policies for the storefront to work
- `newsletter_subscribers` and `orders` must have NO public policies (server-side only access)
- All `directus_*` tables should remain RLS-disabled (managed by Directus)

## Testing Stripe Webhooks Locally

Stripe webhooks need to be forwarded to your local development server for testing the complete checkout flow.

### Setup Steps

1. **Install the Stripe CLI**:
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Other platforms: https://stripe.com/docs/stripe-cli
```

2. **Log in to Stripe**:
```bash
stripe login
```

3. **Forward webhooks to your local server**:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

4. **Copy the webhook signing secret** (`whsec_...`) from the terminal output and add it to your `.env.local`:
```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

5. **Test a purchase** using Stripe's test card:
   - Card number: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - Postal code: Any valid code

The webhook handler will capture the completed payment, save the order to Supabase, and send notification emails (if Resend is configured).

## Checkout Flow

LUNEX uses **Stripe Checkout**, Stripe's hosted payment page — not a custom payment form built in this app.

### How It Works

1. User adds items to cart (persisted in localStorage via Zustand)
2. User selects shipping country and postal code
3. System geocodes postal code → calculates distance from Geneva → returns tiered shipping rate
4. User clicks "Checkout"
5. `/api/checkout` validates stock availability
6. `/api/checkout` creates Stripe Checkout Session with locked shipping country
7. Browser redirects to Stripe's hosted payment page (`session.url`)
8. User completes payment on Stripe's domain (card entry, address form, pay button all live there)
9. Stripe fires `checkout.session.completed` webhook
10. Webhook handler (`/api/webhooks/stripe`) verifies signature, saves order to Supabase, sends emails
11. User redirected back to `/checkout/success`

**Stock validation**: `/api/checkout` checks `stock` table against cart quantities before creating the session. If any item is out of stock, checkout is rejected with a 400 error.

## Shipping Calculator

Distance-based pricing from Geneva (46.2044°N, 6.1432°E):

| Distance | Rate (CHF) |
|----------|-----------|
| ≤ 60 km  | 6         |
| ≤ 150 km | 9         |
| ≤ 350 km | 13        |
| ≤ 700 km | 18        |
| > 700 km | 24        |

**Supported countries**: CH, FR, DE, IT, AT

The cart has a shipping estimator that geocodes postal codes via [Zippopotam.us](https://zippopotam.us) (free, no API key) and prices by straight-line distance. If geocoding fails, it falls back to flat per-country rates (`COUNTRY_FALLBACK_CHF` in `lib/shipping.ts`).

## Order Emails

Uses Resend API when `RESEND_API_KEY` is set:
- **Order notification** — sends "ship this" alert to `ORDER_NOTIFICATION_EMAIL`
- **Customer confirmation** — sends receipt to customer email

Both are safe no-ops if Resend isn't configured. Orders still land in Supabase.

`RESEND_FROM_EMAIL` defaults to `onboarding@resend.dev` (test-only, rate-limited) — verify your own domain in Resend for production.

## Project Structure

```
lunex/
├── app/                          # Next.js App Router pages
│   ├── api/                      # API routes
│   │   ├── checkout/             # Stripe Checkout Session creation
│   │   ├── shipping-estimate/    # Distance-based shipping calculator
│   │   └── webhooks/stripe/      # Stripe webhook handler
│   ├── about/                    # Brand story page
│   ├── cart/                     # Full cart page
│   ├── checkout/success/         # Post-payment confirmation
│   ├── collection/               # Product catalog
│   ├── drops/                    # Drops index and detail pages
│   └── product/[slug]/           # Product detail pages
├── components/                   # React components
│   ├── ProductVisual.tsx         # Procedural SVG product imagery
│   └── RevealOnScroll.tsx        # Scroll-triggered animations
├── lib/                          # Core logic
│   ├── cms.ts                    # Directus/Supabase content layer
│   ├── supabase.ts               # Supabase client factories
│   ├── shipping.ts               # Distance-based shipping calculator
│   ├── email.ts                  # Resend email sender
│   ├── store/cart.ts             # Zustand cart state
│   ├── types.ts                  # TypeScript types
│   └── data/products.ts          # Static fallback data
└── public/                       # Static assets
```

## Development Commands

```bash
npm install              # Install dependencies
npm run dev             # Start dev server (http://localhost:3000, Turbopack)
npm run build           # Production build
npm start               # Start production server
npx eslint .            # Run linter
```

## Design System

### Colors
- **Black**: `#000000` (primary background)
- **Electric Blue**: `#0D01DD` (accent)
- **White**: `#FFFFFF` (primary text)
- **Dark Grey**: `#1A1A1A` (secondary background)

Design tokens live in `app/globals.css` (`@theme` block).

### Typography
- **Headings**: Bebas Neue (self-hosted via @fontsource)
- **Body**: Inter (self-hosted via @fontsource)

No external font fetches at build or runtime.

### Accessibility
- Dark mode only design
- Visible keyboard focus indicators
- Respects `prefers-reduced-motion`
- WCAG AA contrast ratios

## Key Files

- `lib/cms.ts` — content layer with Directus/Supabase integration and static fallback
- `lib/supabase.ts` — client factories (browser client with anon key, service client for server-side)
- `lib/shipping.ts` — distance-based shipping calculator from Geneva
- `lib/email.ts` — Resend email sender for order notifications
- `lib/store/cart.ts` — Zustand cart state with localStorage persistence
- `lib/types.ts` — shared TypeScript types (`Product`, `Drop`, `CartLine`, etc.)
- `components/ProductVisual.tsx` — procedural SVG line art (placeholder for real photography)
- `app/globals.css` — Tailwind CSS v4 with design tokens

## Notes

- Product imagery uses procedural SVG (`ProductVisual.tsx`) — replace with real photography when ready
- Cart state persists in localStorage via Zustand
- Shipping estimates are cached for 24 hours (`next: { revalidate: 86400 }`)
- All monetary amounts use CHF (Swiss Francs)
- The site is fully responsive, mobile-first, dark mode only
- `npm run build` and `npx eslint .` both pass clean

## License

[Add your license here]
