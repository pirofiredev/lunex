import { Product, Drop } from "@/lib/types";

/**
 * Placeholder catalog. In production this array is replaced by a call
 * into lib/cms.ts (Sanity, Contentful, Supabase table, etc). Shape stays
 * identical so swapping the data source never touches a component.
 */
export const PRODUCTS: Product[] = [];

export const DROPS: Drop[] = [];
