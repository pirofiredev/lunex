import Stripe from "stripe";

let stripeSingleton: Stripe | null = null;

/** Server-only. Import from route handlers / server actions, never from client components. */
export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add it to .env.local — see .env.example."
    );
  }
  if (!stripeSingleton) {
    stripeSingleton = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeSingleton;
}
